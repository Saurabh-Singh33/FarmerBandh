using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FarmerBandh.Application.DTOs.Chatbot;
using FarmerBandh.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FarmerBandh.Application.Services;

public class ChatbotService : IChatbotService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChatbotService> _logger;

    public ChatbotService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ChatbotService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ChatbotResponseDto> ProcessMessageAsync(ChatbotRequestDto request, string? userRole, string? userName)
    {
        var lang = DetectLanguage(request.Message, request.Language);
        var isAdmin = string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase);
        var isFarmer = string.Equals(userRole, "Farmer", StringComparison.OrdinalIgnoreCase);
        var isBuyer = string.Equals(userRole, "Buyer", StringComparison.OrdinalIgnoreCase);

        var apiKey = Environment.GetEnvironmentVariable("OPENROUTER_API_KEY")
            ?? _configuration["OPENROUTER_API_KEY"]
            ?? _configuration["OpenRouter:ApiKey"]
            ?? ReadKeyFromEnvFiles("OPENROUTER_API_KEY");

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                var llmReply = await CallOpenRouterApiAsync(request, apiKey, isAdmin, userRole, userName, lang);
                if (!string.IsNullOrWhiteSpace(llmReply))
                {
                    return new ChatbotResponseDto
                    {
                        Reply = llmReply.Trim(),
                        Language = lang,
                        IsAdminMode = isAdmin,
                        SuggestedFollowUps = GenerateFollowUps(lang, isAdmin, isFarmer)
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OpenRouter API call failed or timed out. Falling back to local domain knowledge engine.");
            }
        }

        // Graceful intelligent fallback if API key is not yet set or during network failure
        var fallbackReply = GenerateFallbackReply(request.Message, lang, isAdmin, isFarmer, isBuyer, userName);
        var note = string.IsNullOrWhiteSpace(apiKey)
            ? GetApiKeyMissingNote(lang)
            : string.Empty;

        return new ChatbotResponseDto
        {
            Reply = string.IsNullOrEmpty(note) ? fallbackReply : $"{fallbackReply}\n\n_{note}_",
            Language = lang,
            IsAdminMode = isAdmin,
            SuggestedFollowUps = GenerateFollowUps(lang, isAdmin, isFarmer)
        };
    }

    private async Task<string?> CallOpenRouterApiAsync(
        ChatbotRequestDto request,
        string apiKey,
        bool isAdmin,
        string? userRole,
        string? userName,
        string lang)
    {
        var preferredModel = Environment.GetEnvironmentVariable("OPENROUTER_MODEL")
            ?? _configuration["OPENROUTER_MODEL"]
            ?? ReadKeyFromEnvFiles("OPENROUTER_MODEL")
            ?? "google/gemma-4-26b-a4b-it:free";

        var candidateModels = new List<string>();
        if (!string.IsNullOrWhiteSpace(preferredModel))
            candidateModels.Add(preferredModel.Trim());

        var activeModels = new[]
        {
            "google/gemma-4-26b-a4b-it:free",
            "poolside/laguna-s-2.1:free",
            "nvidia/nemotron-3-ultra-550b-a55b:free",
            "dots-studio/dots-3-note-preview:free"
        };

        foreach (var m in activeModels)
        {
            if (!candidateModels.Contains(m))
                candidateModels.Add(m);
        }

        var systemPrompt = BuildSystemPrompt(isAdmin, userRole, userName, lang);

        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        if (request.History != null && request.History.Count > 0)
        {
            foreach (var h in request.History.TakeLast(6))
            {
                if (!string.IsNullOrWhiteSpace(h.Content))
                {
                    var r = h.Role?.ToLower() == "assistant" ? "assistant" : "user";
                    messages.Add(new { role = r, content = h.Content });
                }
            }
        }

        messages.Add(new { role = "user", content = request.Message });

        var client = _httpClientFactory.CreateClient();

        foreach (var model in candidateModels)
        {
            try
            {
                var payload = new
                {
                    model = model,
                    messages = messages,
                    temperature = 0.3,
                    max_tokens = 500
                };

                var requestJson = JsonSerializer.Serialize(payload);
                using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions")
                {
                    Content = new StringContent(requestJson, Encoding.UTF8, "application/json")
                };

                httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey.Trim());
                httpRequest.Headers.Add("HTTP-Referer", "https://farmerbandh.com");
                httpRequest.Headers.Add("X-Title", "FarmerBandh Agrarian Assistant");

                // Fast 6-second timeout per candidate to ensure immediate UI responsiveness
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(6));
                var response = await client.SendAsync(httpRequest, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    var errBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("OpenRouter model {Model} returned HTTP {StatusCode}: {ErrorBody}. Trying next candidate.", model, response.StatusCode, errBody);
                    continue;
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);
                if (doc.RootElement.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                {
                    var firstChoice = choices[0];
                    if (firstChoice.TryGetProperty("message", out var msgObj) && msgObj.TryGetProperty("content", out var contentElem))
                    {
                        var text = contentElem.GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            return text;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Model {Model} call failed, trying next candidate.", model);
            }
        }

        return null;
    }

    private static string? ReadKeyFromEnvFiles(string key)
    {
        var searchDirs = new[]
        {
            Directory.GetCurrentDirectory(),
            Path.Combine(Directory.GetCurrentDirectory(), ".."),
            Path.Combine(Directory.GetCurrentDirectory(), "Server"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "Server"),
            AppDomain.CurrentDomain.BaseDirectory
        };

        foreach (var dir in searchDirs)
        {
            try
            {
                var p = Path.Combine(dir, ".env");
                if (File.Exists(p))
                {
                    foreach (var line in File.ReadAllLines(p))
                    {
                        var t = line.Trim();
                        if (t.StartsWith($"{key}="))
                        {
                            var val = t.Substring(key.Length + 1).Trim().Trim('"', '\'');
                            if (!string.IsNullOrWhiteSpace(val)) return val;
                        }
                    }
                }
            }
            catch { }
        }
        return null;
    }

    private static string BuildSystemPrompt(bool isAdmin, string? userRole, string? userName, string lang)
    {
        var cleanName = !string.IsNullOrWhiteSpace(userName) && !userName.Contains('@') ? userName : "Kisan Mitra";
        var sb = new StringBuilder();
        sb.AppendLine("You are KrishiMitra (कृषिमित्र / કૃષિમિત્ર), the dedicated, polite, warm, and helpful AI assistant for FarmerBandh.");
        sb.AppendLine("FarmerBandh is India's premier agrarian direct marketplace platform connecting verified regional farmers directly with wholesale and retail produce buyers.");
        sb.AppendLine($"The current user's name is: {cleanName}. You should address them politely by this name or respectful title. NEVER use email addresses or technical IDs.");
        sb.AppendLine("NEVER identify as any third-party model (such as LLaMA, Gemma, Dots, Liquid, or Nemotron). Your identity is solely KrishiMitra (कृषिमित्र / કૃષિમિત્ર), FarmerBandh's official AI assistant.");
        sb.AppendLine("When asked what your actual work is, what you do, or who you are, give a direct, thorough, and helpful answer summarizing your key services: crop marketplace trading in quintals (Grade A/B/C), direct price bargaining with farmers, Razorpay/COD payments, delivery slots, escrow dispute resolution, and farmer KYC verification.");

        sb.AppendLine();
        sb.AppendLine("CRITICAL RULE #1 - STRICT PROJECT SCOPE ONLY:");
        sb.AppendLine("You MUST ONLY answer questions strictly regarding FarmerBandh, its features, farming crops marketplace, volume quintal trading, harvest grades, bargaining & negotiations, delivery slots, tracking, returns, disputes, Razorpay payment links, farmer verification KYC, and agrarian payouts.");
        sb.AppendLine("If the user asks ANY question outside of FarmerBandh (e.g. general coding, trivia, movies, politics, science, math, other apps, personal advice), you MUST politely refuse and state that you are exclusively designed to assist with FarmerBandh agrarian platform operations.");

        sb.AppendLine();
        sb.AppendLine("CRITICAL RULE #2 - ROLE-BASED ADMIN SECURITY:");
        if (isAdmin)
        {
            sb.AppendLine("The current user is an AUTHENTICATED ADMINISTRATOR of FarmerBandh.");
            sb.AppendLine("You CAN explain and assist with admin control center features:");
            sb.AppendLine("- Approving or rejecting farmer verification KYC documents (7/12 extract / Patta, Aadhaar card, bank passbook).");
            sb.AppendLine("- Dispute arbitration & parcel inspection decisions.");
            sb.AppendLine("- Processing customer refunds and releasing escrow.");
            sb.AppendLine("- Overseeing farmer seller bank account payouts.");
            sb.AppendLine("- Platform commission percentages and delivery fee settings in Admin Settings.");
            sb.AppendLine("- Auditing platform activity logs.");
        }
        else
        {
            sb.AppendLine($"The current user is a {(string.IsNullOrWhiteSpace(userRole) ? "Guest / Buyer / Farmer" : userRole)} (NOT an Admin).");
            sb.AppendLine("You MUST NEVER reveal or discuss admin-only panels (/admin/*), admin dispute arbitration mechanisms, backend configs, internal commission calculations, or admin approval credentials.");
            sb.AppendLine("If the user asks about administrative powers or asks how to verify other farmers or force payouts, inform them politely that administrative controls are strictly restricted to authorized FarmerBandh administrators.");
        }

        sb.AppendLine();
        sb.AppendLine("CRITICAL RULE #3 - MULTILINGUAL VOICE & TEXT OUTPUT:");
        sb.AppendLine($"The requested response language is: '{lang.ToUpperInvariant()}'.");
        sb.AppendLine("- If 'HI' (Hindi): Respond in natural, warm, polite Hindi in Devanagari script (हिन्दी).");
        sb.AppendLine("- If 'GU' (Gujarati): Respond in natural, warm, polite Gujarati in Gujarati script (ગુજરાતી).");
        sb.AppendLine("- If 'EN' (English): Respond in clear, friendly, and professional English.");
        sb.AppendLine("If the user sends greetings like 'Kaise ho', 'Hello', 'Namaste', respond warmly (e.g. 'मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद!...') and offer assistance on FarmerBandh.");
        sb.AppendLine("Keep sentences concise, clear, and easy to be read aloud via Text-to-Speech (TTS). Avoid unnecessary asterisks or complicated markdown tables that sound confusing when spoken.");

        sb.AppendLine();
        sb.AppendLine("CORE FARMERBANDH KNOWLEDGE:");
        sb.AppendLine("- Direct Trade: Eliminates intermediate mandi brokers and commission agents.");
        sb.AppendLine("- Volume: Produce sold in Quintals (1 Quintal = 100 kg).");
        sb.AppendLine("- Grades: Grade A (Premium export-ready), Grade B (Standard commercial), Grade C (Processing/Economy).");
        sb.AppendLine("- Negotiations: Buyers can negotiate prices and bundle multiple crop items together.");
        sb.AppendLine("- Payment Methods: Razorpay Payment Link (Link ID: plink_Tqe4bgUXaopgZ0, URL: https://rzp.io/rzp/MkpDZkX), UPI/GPay/PhonePe, Credit/Debit Cards, NetBanking, and Cash on Delivery (COD).");
        sb.AppendLine("- Flexible Payments: Buyers can pay custom/flexible amounts (less or more than ₹100,000, including advance token deposits or full amounts).");
        sb.AppendLine("- Delivery: Morning (8 AM - 12 PM), Afternoon (12 PM - 4 PM), Evening (4 PM - 8 PM) slots.");
        sb.AppendLine("- Returns & Disputes: 48-hour return window for damaged or sub-grade produce.");
        sb.AppendLine("- Farmer Onboarding: 3-step KYC: Land record (7/12 extract), Govt ID (Aadhaar), and Bank/UPI details.");

        return sb.ToString();
    }

    private static string DetectLanguage(string? message, string? defaultLang)
    {
        if (string.IsNullOrWhiteSpace(message))
            return NormalizeLanguage(defaultLang);

        var text = message.Trim();

        // 1. Unicode script detection: Devanagari (Hindi) or Gujarati script
        if (text.Any(c => c >= 0x0900 && c <= 0x097F))
            return "hi";

        if (text.Any(c => c >= 0x0A80 && c <= 0x0AFF))
            return "gu";

        // 2. Romanized keywords detection (Hinglish / Gujlish)
        var lower = text.ToLowerInvariant();
        var words = lower.Split(new[] { ' ', '.', ',', '?', '!', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries);

        var hindiTerms = new HashSet<string>
        {
            "namaste", "kaise", "kaisa", "kya", "hai", "hain", "karo", "kisan", "fasal",
            "bhav", "daam", "kharidna", "bechna", "kharid", "bech", "paise", "bhai",
            "mera", "meri", "mere", "aapka", "aapki", "aapke", "tumhara", "aap", "mujhe",
            "hum", "nahi", "nahin", "molbhav", "kheti", "mandi", "dhanyawad"
        };

        var gujaratiTerms = new HashSet<string>
        {
            "kem", "cho", "tamaru", "maru", "mane", "pak", "khedut",
            "su", "shu", "che", "nathi", "karvu", "kharidi", "vechan", "aabhar"
        };

        var hindiCount = words.Count(w => hindiTerms.Contains(w));
        var gujaratiCount = words.Count(w => gujaratiTerms.Contains(w));

        if (hindiCount >= 2 || (hindiCount == 1 && words.Length <= 4))
            return "hi";

        if (gujaratiCount >= 2 || (gujaratiCount == 1 && words.Length <= 4))
            return "gu";

        var englishTerms = new HashSet<string>
        {
            "what", "how", "who", "where", "when", "why", "can", "could", "is", "are",
            "the", "your", "my", "you", "hello", "hi", "work", "help", "crop", "crops",
            "price", "negotiate", "pay", "payment", "delivery", "buy", "sell", "order"
        };

        var englishCount = words.Count(w => englishTerms.Contains(w));
        if (englishCount >= 1)
            return "en";

        return NormalizeLanguage(defaultLang);
    }

    private static string NormalizeLanguage(string? lang)
    {
        if (string.IsNullOrWhiteSpace(lang)) return "en";
        var lower = lang.Trim().ToLowerInvariant();
        if (lower.StartsWith("hi")) return "hi";
        if (lower.StartsWith("gu")) return "gu";
        return "en";
    }

    private static string GetApiKeyMissingNote(string lang)
    {
        return lang switch
        {
            "hi" => "नोट: बैकएंड .env में OPENROUTER_API_KEY जोड़ने पर लाइव डीप एआई मॉडल सक्रिय हो जाएगा।",
            "gu" => "નોંધ: બેકએન્ડ .env માં OPENROUTER_API_KEY ઉમેરવા પર લાઇવ ડીપ AI મોડેલ સક્રિય થશે.",
            _ => "Note: Live deep OpenRouter AI will activate once OPENROUTER_API_KEY is configured in backend .env."
        };
    }

    private static string GenerateFallbackReply(string? userMsg, string lang, bool isAdmin, bool isFarmer, bool isBuyer, string? userName)
    {
        var text = (userMsg ?? string.Empty).ToLowerInvariant().Trim();

        // Format clean greeting name with proper script
        var greetingName = !string.IsNullOrWhiteSpace(userName) && !userName.Contains('@')
            ? userName
            : (isAdmin ? "Admin" : (isFarmer ? (lang == "gu" ? "ખેડૂત મિત્ર" : (lang == "hi" ? "किसान मित्र" : "Kisan Mitra")) : (lang == "gu" ? "મિત્ર" : (lang == "hi" ? "मित्र" : "Friend"))));

        // 1. External question check (Strict Scope Guardrail)
        if (IsExternalQuestion(text))
        {
            return lang switch
            {
                "hi" => "नमस्ते! मैं कृषिमित्र हूँ, फार्मरबंध का समर्पित एआई सहायक। मैं केवल फार्मरबंध प्लेटफॉर्म, फसलों, ऑर्डर, भुगतान और कृषि व्यापार से संबंधित प्रश्नों में ही आपकी सहायता कर सकता हूँ। बाहरी प्रश्नों का उत्तर देना मेरे कार्यक्षेत्र से बाहर है।",
                "gu" => "નમસ્તે! હું કૃષિમિત્ર છું, ફાર્મરબંધનું સમર્પિત AI સહાયક. હું ફક્ત ફાર્મરબંધ પ્લેટફોર્મ, પાકો, ઓર્ડર, ચુકવણી અને કૃષિ વેપાર સંબંધિત પ્રશ્નોમાં જ તમને મદદ કરી શકું છું. બહારના પ્રશ્નોનો જવાબ આપવો મારા કાર્યક્ષેત્ર બહાર છે.",
                _ => "Hello! I am KrishiMitra, the dedicated FarmerBandh AI companion. I can only assist with questions directly related to the FarmerBandh agrarian platform, crop marketplace, orders, Razorpay payments, and farm operations. External topics are outside my scope."
            };
        }

        // 2. Identity, Role, Purpose & "Actual Work" (Highest priority intent matching)
        if (IsIdentityOrWorkQuery(text))
        {
            return lang switch
            {
                "hi" => $"नमस्ते {greetingName}! मैं कृषिमित्र हूँ, फार्मरबंध का आधिकारिक कृषि AI सहायक।\n\nमेरा वास्तविक कार्य और उद्देश्य क्षेत्रीय किसानों को थोक व खुदरा खरीदारों से सीधे जोड़ना है, ताकि मंडी दलालों और बिचौलियों की कमीशन खत्म हो सके। मेरे मुख्य कार्य निम्नलिखित हैं:\n\n1. 🌾 फसल खरीद व बिक्री: गेहूं, चावल, प्याज, आलू, लहसुन आदि सभी फसलों की गुणवत्ता ग्रेड (Grade A, B, C) और प्रति क्विंटल (100 किग्रा) भाव के साथ खोज व पारदर्शी लिस्टिंग।\n2. 🤝 भाव मोलभाव (Negotiation): 'Negotiate Price' सुविधा द्वारा खरीदार और किसान के बीच प्रति क्विंटल सही भाव तय करने में सीधी बातचीत।\n3. 💳 सुरक्षित भुगतान: रेज़रपे पेमेंट लिंक, मनपसंद टोकन एडवांस और कैश ऑन डिलीवरी (COD) के साथ सुरक्षित एस्क्रो लेन-देन।\n4. 🚚 डिलीवरी स्लॉट: सुबह (8-12), दोपहर (12-4) और शाम (4-8) के सुरक्षित डिलीवरी स्लॉट और लाइव ऑर्डर ट्रैकिंग।\n5. 🛡️ विवाद व रिफंड: खराब या घटिया फसल मिलने पर 48 घंटे की रिटर्न पॉलिसी और दोनों पक्षों के पैसों की पूर्ण एस्क्रो सुरक्षा।\n6. 📋 किसान सत्यापन (KYC): 7/12 खतौनी और आधार कार्ड द्वारा किसानों का दस्तावेज़ सत्यापन ताकि उन्हें वेरिफाइड सेलर बैज मिल सके।\n\nआज आपके कृषि व्यापार या फसल खरीद-बिक्री में मैं क्या सहायता करूँ?",
                "gu" => $"નમસ્તે {greetingName}! હું કૃષિમિત્ર છું, ફાર્મરબંધનું સત્તાવાર કૃષિ AI સહાયક.\n\nમારું વાસ્તવિક કામ અને મુખ્ય ઉદ્દેશ્ય સ્થાનિક ખેડૂતોને સીધા વેપારીઓ અને ખરીદદારો સાથે જોડવાનું છે, જેથી વચેટિયા કે મંડી દલાલો વગર સીધો વેપાર થઈ શકે. મારા મુખ્ય કાર્યો નીચે મુજબ છે:\n\n૧. 🌾 પાક ખરીદ-વેચાણ: ઘઉં, ડાંગર, ડુંગળી, બટાકા, લસણ સહિત તમામ પાકની ગુણવત્તા ગ્રેડ (A, B, C) મુજબ ક્વિન્ટલ દીઠ (૧ ક્વિન્ટલ = ૧૦૦ કિગ્રા) શોધ અને લિસ્ટિંગ.\n૨. 🤝 ભાવ વાટાઘાટો (Negotiation): 'Negotiate Price' ટૂલ દ્વારા ખેડૂત અને ખરીદદાર વચ્ચે સીધા વ્યાજબી ભાવ નક્કી કરવા સહાય.\n૩. 💳 સુરક્ષિત ચુકવણી: રેઝરપે પેમેન્ટ લિંક, એડવાન્સ ટોકન રકમ અને કેશ ઓન ડિલિવરી (COD) સાથે એસ્ક્રો સુરક્ષિત વ્યવહાર.\n૪. 🚚 ડિલિવરી સ્લોટ: સવાર (૮-૧૨), બપોર (૧૨-૪) અને સાંજ (૪-૮) ના સુરક્ષિત ડિલિવરી સ્લોટ અને ઓર્ડર ટ્રેકિંગ.\n૫. 🛡️ વિવાદ અને રિફંડ: ગુણવત્તામાં ખામી હોય તો ૪૮ કલાકની રિટર્ન નીતિ અને ખેડૂત-ખરીદદાર બંનેના નાણાંનું રક્ષણ.\n૬. 📋 ખેડૂત ચકાસણી (KYC): ૭/૧૨ અને આધાર કાર્ડ અપલોડ કરી વેરિફાઇડ ખેડૂત બનવામાં માર્ગદર્શન.\n\nઆજે તમારા પાક વેચાણ, ખરીદી કે ભાવ વિશે હું શું મદદ કરું?",
                _ => $"Hello {greetingName}! I am KrishiMitra, the dedicated Agrarian AI Assistant for FarmerBandh.\n\nMy actual work and core purpose is to connect regional farmers directly with produce buyers without middlemen or mandi commissions. Here is exactly what I do:\n\n1. 🌾 Crop Marketplace: Browse, search, and list farm-fresh harvests (Wheat, Rice, Onion, Potato, Garlic, etc.) in quintals (1 quintal = 100 kg) with transparent Grade A, B, and C quality metrics.\n2. 🤝 Price Negotiation: Guide buyers and farmers to negotiate custom bulk rates per quintal directly using our live 'Negotiate Price' tool.\n3. 💳 Secure Payments: Assist with payments via Razorpay Payment Link, flexible advance token deposits, and Cash on Delivery (COD) with escrow protection.\n4. 🚚 Verified Logistics: Help schedule and track Morning (8 AM - 12 PM), Afternoon (12 PM - 4 PM), and Evening (4 PM - 8 PM) delivery slots.\n5. 🛡️ Dispute Resolution: Provide guidance on our 48-hour return window for damaged produce and safeguard funds for both farmers and buyers.\n6. 📋 Farmer KYC: Guide farmers through 7/12 land record, Aadhaar, and bank verification to receive their verified seller badge.\n\nHow can I assist your farming or produce purchasing today?"
            };
        }

        // 3. Admin queries check
        if (text.Contains("admin") || text.Contains("arbitrat") || text.Contains("approve") || text.Contains("commission"))
        {
            if (!isAdmin)
            {
                return lang switch
                {
                    "hi" => "प्रशासनिक कार्य और किसान सत्यापन की मंजूरी केवल अधिकृत फार्मरबंध एडमिन द्वारा ही की जाती है। यदि आप किसान हैं, तो अपनी प्रोफ़ाइल में जाकर 7/12 खतौनी और आधार कार्ड अपलोड कर सकते हैं।",
                    "gu" => "વહીવટી કાર્યો અને ખેડૂત ચકાસણીની મંજૂરી ફક્ત અધિકૃત ફાર્મરબંધ એડમિન દ્વારા જ કરવામાં આવે છે. જો તમે ખેડૂત છો, તો તમારી પ્રોફાઇલમાં જઈને 7/12 અને આધાર અપલોડ કરી શકો છો.",
                    _ => "Administrative controls and farmer KYC verification approvals are strictly restricted to authorized FarmerBandh administrators. If you are a farmer seller, you can submit your 7/12 extract and Aadhaar under Seller Verification."
                };
            }
            else
            {
                return lang switch
                {
                    "hi" => "एडमिन कंट्रोल सेंटर में आपका स्वागत है! आप साइडबार में 'Verifications' से किसानों के 7/12 खतौनी और आधार की जांच कर सकते हैं, 'Disputes' से विवादों का निपटारा कर सकते हैं, और 'Settings' से प्लेटफॉर्म कमीशन सेट कर सकते हैं।",
                    "gu" => "એડમિન કંટ્રોલ સેન્ટરમાં તમારું સ્વાગત છે! તમે સાઇડબારમાં 'Verifications' થી ખેડૂતોના 7/12 અને આધારની ચકાસણી કરી શકો છો, 'Disputes' થી વિવાદોનો ઉકેલ લાવી શકો છો, અને 'Settings' થી પ્લેટફોર્મ કમિશન સેટ કરી શકો છો.",
                    _ => "Welcome, Administrator! You have access to Admin Control Center: 1) Verify pending farmer 7/12 & Aadhaar documents in Verifications; 2) Arbitrate buyer-seller disputes in Disputes; 3) Review and release farmer payouts; 4) Configure platform commissions in Admin Settings."
                };
            }
        }

        // 4. How to Buy Crops / Order Placement
        if (text.Contains("how to buy") || text.Contains("buy crop") || text.Contains("how to order") || text.Contains("order crop") ||
            text.Contains("purchase") || text.Contains("kharid") || text.Contains("खरीद") || text.Contains("ખરીદ"))
        {
            return lang switch
            {
                "hi" => "फार्मरबंध पर फसल खरीदने की आसान प्रक्रिया:\n1. मुख्य मेनू या डैशबोर्ड से 'Marketplace' पर जाएं।\n2. फसल का नाम (गेहूं, प्याज, आलू आदि) और गुणवत्ता ग्रेड (Grade A, B, C) चुनें।\n3. प्रति क्विंटल (1 क्विंटल = 100 किग्रा) भाव और किसान का वेरिफाइड लोकेशन देखें।\n4. सीधे खरीदने के लिए 'Add to Cart' दबाएं, या अपना भाव देने के लिए 'Negotiate Price' दबाएं।\n5. चेकआउट पर अपना मनपसंद डिलीवरी स्लॉट और पेमेंट विकल्प (रेज़रपे या कैश ऑन डिलीवरी) चुनें।",
                "gu" => "ફાર્મરબંધ પર પાક ખરીદવાની સરળ રીત:\n૧. મુખ્ય મેનૂમાંથી 'Marketplace' પર જાઓ.\n૨. પાકનું નામ (ઘઉં, ડુંગળી, બટાકા વગેરે) અને ગુણવત્તા ગ્રેડ (A, B, C) પસંદ કરો.\n૩. ક્વિન્ટલ દીઠ ભાવ અને ખેડૂતનું સ્થાન ચકાસો.\n૪. સીધા ઓર્ડર માટે 'Add to Cart' અથવા વ્યાજબી ભાવની ઓફર માટે 'Negotiate Price' દબાવો.\n૫. ચેકઆઉટ વખતે અનુકૂળ ડિલિવરી સ્લોટ અને પેમેન્ટ વિકલ્પ (રેઝરપે અથવા કેશ ઓન ડિલિવરી) પસંદ કરો.",
                _ => "To buy crops on FarmerBandh:\n1. Navigate to the 'Marketplace' from the top navigation.\n2. Filter by crop (Wheat, Onion, Potato, etc.) and quality Grade (Grade A, B, or C).\n3. Check the price per quintal (100 kg) and verified farmer profile.\n4. Click 'Add to Cart' for immediate purchase or 'Negotiate Price' to submit a custom price offer.\n5. Proceed to checkout, choose your preferred delivery slot, and select Razorpay or Cash on Delivery (COD)."
            };
        }

        // 5. How to Sell Crops / Farmer Listing
        if (text.Contains("how to sell") || text.Contains("sell crop") || text.Contains("list crop") || text.Contains("add crop") ||
            text.Contains("bechna") || text.Contains("बेच") || text.Contains("વેચ") || text.Contains("લિસ્ટ"))
        {
            return lang switch
            {
                "hi" => "फार्मरबंध पर किसान अपनी फसल ऐसे बेच सकते हैं:\n1. किसान खाते में लॉगिन करके 'Seller Dashboard' पर जाएं।\n2. 'List New Crop' या 'Add Produce' बटन पर क्लिक करें।\n3. फसल का नाम, कुल उपलब्ध मात्रा (क्विंटल में), ग्रेड (A, B या C) और अपेक्षित भाव दर्ज करें।\n4. फसल की स्पष्ट फोटो और कटाई/उपलब्धता की तारीख चुनें।\n5. लिस्टिंग सबमिट करते ही क्षेत्रीय व्यापारी और खरीदार आपके पास सीधे ऑर्डर या भाव मोलभाव भेज सकेंगे।",
                "gu" => "ખેડૂત મિત્રો પોતાની ઉપજ ફાર્મરબંધ પર આ રીતે વેચી શકે છે:\n૧. ખેડૂત એકાઉન્ટમાં લોગિન કરી 'Seller Dashboard' પર જાઓ.\n૨. 'List New Crop' બટન પર ક્લિક કરો.\n૩. પાકનું નામ, ઉપલબ્ધ જથ્થો (ક્વિન્ટલમાં), ગુણવત્તા ગ્રેડ (A, B, C) અને ક્વિન્ટલ દીઠ ભાવ દાખલ કરો.\n૪. પાકની સ્પષ્ટ તસવીરો અને કાપણીની તારીખ ઉમેરો.\n૫. લિસ્ટિંગ સબમિટ કરતાં જ ખરીદદારો સીધા ઓર્ડર આપી શકશે અથવા ભાવ વાટાઘાટો કરી શકશે.",
                _ => "To sell crops on FarmerBandh as a farmer:\n1. Log in and go to your 'Seller Dashboard'.\n2. Click on 'List New Crop'.\n3. Enter the crop name, total available volume in quintals, quality Grade (A, B, or C), and your expected price per quintal.\n4. Upload clear harvest photos and set harvest/dispatch dates.\n5. Once submitted, regional wholesale and retail buyers can view your listing and send direct orders or price offers."
            };
        }

        // 6. Price Bargaining & Negotiations
        if (text.Contains("negotiat") || text.Contains("bargain") || text.Contains("discount") ||
            text.Contains("मोलभाव") || text.Contains("भाव कम") || text.Contains("दाम कम") ||
            text.Contains("વાટાઘાટો") || text.Contains("ભાવ ઘટાડવો") || text.Contains("ભાવ"))
        {
            return lang switch
            {
                "hi" => "फार्मरबंध पर सीधे किसान से भाव मोलभाव (Negotiation) की सुविधा है:\n1. मार्केटप्लेस में किसी भी फसल कार्ड पर हरा 'Negotiate Price' बटन दबाएं।\n2. अपनी प्रस्तावित कीमत (प्रति क्विंटल) और आवश्यक मात्रा दर्ज करें।\n3. किसान को तुरंत नोटिफिकेशन मिलेगा और वह आपका भाव स्वीकार (Accept), नया भाव (Counter) या अस्वीकार (Decline) कर सकता है।\n4. किसान द्वारा भाव स्वीकार होते ही वह रियायती दर आपके चेकआउट कार्ट में अपने-आप लॉक हो जाती है।",
                "gu" => "ફાર્મરબંધ પર સીધા ખેડૂત સાથે ભાવ વાટાઘાટો (Negotiation) ની સુવિધા છે:\n૧. માર્કેટપ્લેસમાં પાક પર આવેલ લીલું 'Negotiate Price' બટન દબાવો.\n૨. તમારી પ્રસ્તાવિત કિંમત (ક્વિન્ટલ દીઠ) અને જથ્થો દાખલ કરો.\n૩. ખેડૂતને તાત્કાલિક ઓફર મળશે અને તેઓ સ્વીકારી (Accept) અથવા કાઉન્ટર ઓફર આપી શકે છે.\n૪. ઓફર મંજૂર થતાં જ તે વ્યાજબી ભાવ આપમેળે તમારા ચેકઆઉટ કાર્ટમાં લોક થઈ જશે.",
                _ => "FarmerBandh enables direct price bargaining without mandi brokers:\n1. On any crop listing card in Marketplace, click the green 'Negotiate Price' button.\n2. Enter your counter-offer price per quintal and requested quantity.\n3. The farmer receives your bid immediately and can Accept, Counter-offer, or Decline.\n4. Once accepted, the newly agreed price is automatically locked into your checkout order."
            };
        }

        // 7. Payment, Razorpay Link & Cash on Delivery (COD)
        if (text.Contains("pay") || text.Contains("razorpay") || text.Contains("upi") || text.Contains("link") ||
            text.Contains("cod") || text.Contains("cash on delivery") || text.Contains("advance") || text.Contains("token") ||
            text.Contains("पैसे") || text.Contains("भुगतान") || text.Contains("ચુકવણી") || text.Contains("રોકડ"))
        {
            return lang switch
            {
                "hi" => "फार्मरबंध सुरक्षित व लचीली भुगतान सुविधाएं प्रदान करता है:\n1. रेज़रपे पेमेंट लिंक: (plink_Tqe4bgUXaopgZ0 / https://rzp.io/rzp/MkpDZkX) द्वारा खरीदार ₹1,00,000 या अपनी सुविधानुसार कम/ज्यादा टोकन राशि UPI (GPay, PhonePe), कार्ड या नेटबैंकिंग से चुका सकते हैं।\n2. कैश ऑन डिलीवरी (COD): माल की डिलीवरी और जांच के बाद मौके पर नकद भुगतान।\n3. एस्क्रो सुरक्षा: खरीदार द्वारा चुकाई गई राशि डिलीवरी पूरी होने और 48 घंटे के निरीक्षण के बाद ही किसान के खाते में सुरक्षित ट्रांसफर की जाती है।",
                "gu" => "ફાર્મરબંધ સુરક્ષિત અને લવચીક ચુકવણી વિકલ્પો પ્રદાન કરે છે:\n૧. રેઝરપે પેમેન્ટ લિંક: (plink_Tqe4bgUXaopgZ0 / https://rzp.io/rzp/MkpDZkX) દ્વારા ખરીદદારો ₹૧,૦૦,૦૦૦ અથવા ઈચ્છા મુજબ ઓછી/વધુ ટોકન રકમ UPI, કાર્ડ કે નેટબેંકિંગથી ચૂકવી શકે છે.\n૨. કેશ ઓન ડિલિવરી (COD): માલ ડિલિવરી સમયે રૂબરૂ ચુકવણી.\n૩. એસ્ક્રો સુરક્ષા: ચુકવણી માલની ગુણવત્તા ચકાસ્યા પછી જ ખેડૂતને ટ્રાન્સફર થાય છે.",
                _ => "FarmerBandh offers secure and flexible payment options:\n1. Razorpay Payment Link: (Link ID: plink_Tqe4bgUXaopgZ0, https://rzp.io/rzp/MkpDZkX) allows buyers to pay the default ₹100,000 or any custom flexible advance token amount via UPI (GPay, PhonePe), Cards, or NetBanking.\n2. Cash on Delivery (COD): Pay directly upon physical crop delivery and inspection.\n3. Escrow Security: Payments are securely held until delivery inspection is verified, protecting both farmer and buyer."
            };
        }

        // 8. Delivery Slots & Tracking
        if (text.Contains("delivery") || text.Contains("slot") || text.Contains("dispatch") || text.Contains("tracking") ||
            text.Contains("डिलीवरी") || text.Contains("स्लॉट") || text.Contains("ट्रैकिंग") || text.Contains("ડિલિવરી"))
        {
            return lang switch
            {
                "hi" => "फार्मरबंध पर डिलीवरी स्लॉट और ट्रैकिंग की जानकारी:\n- स्लॉट विकल्प: सुबह (8 AM - 12 PM), दोपहर (12 PM - 4 PM) और शाम (4 PM - 8 PM)।\n- डोर-स्टेप डिलीवरी: खेत से सीधे आपके पते तक सुरक्षित परिवहन।\n- ऑर्डर ट्रैकिंग: 'Order Tracking' पेज पर जाकर वाहन की लोकेशन और डिलीवरी स्थिति लाइव देख सकते हैं।",
                "gu" => "ફાર્મરબંધ પર ડિલિવરી સ્લોટ અને ટ્રેકિંગ વિગતો:\n- સ્લોટ વિકલ્પો: સવાર (૮ AM - ૧૨ PM), બપોર (૧૨ PM - ૪ PM) અને સાંજ (૪ PM - ૮ PM).\n- સીધી ડિલિવરી: ખેતરથી તમારા સરનામાં સુધી સુરક્ષિત વાહન વ્યવહાર.\n- ઓર્ડર ટ્રેકિંગ: 'Order Tracking' પેજ પરથી ઓર્ડરની પ્રગતિ જોઈ શકો છો.",
                _ => "FarmerBandh Delivery Slots & Logistics:\n- Available Slots: Morning (8 AM - 12 PM), Afternoon (12 PM - 4 PM), and Evening (4 PM - 8 PM).\n- Farm-to-Door Delivery: Direct transport from the farmer's field to your warehouse or store.\n- Live Tracking: Real-time status updates are visible under 'Order Tracking' in your dashboard."
            };
        }

        // 9. Returns, Disputes & Damaged Produce
        if (text.Contains("dispute") || text.Contains("refund") || text.Contains("return") || text.Contains("damaged") ||
            text.Contains("खराब") || text.Contains("रिफंड") || text.Contains("शिकायत") || text.Contains("રિફંડ") || text.Contains("વિવાદ"))
        {
            return lang switch
            {
                "hi" => "विवाद और रिफंड सुरक्षा:\n- 48 घंटे का रिटर्न विंडो: यदि प्राप्त फसल खराब, सड़ी या तय ग्रेड से घटिया है, तो आप 48 घंटे के भीतर ऑर्डर हिस्ट्री से 'Raise Dispute' कर सकते हैं।\n- फोटो सबूत: खराब फसल की फोटो अपलोड करें।\n- एस्क्रो सुरक्षा: विवाद सुलझने तक भुगतान रोक दिया जाता है और एडमिन जांच के बाद पूरा या आंशिक रिफंड जारी किया जाता है।",
                "gu" => "વિવાદ અને રિફંડ સુરક્ષા:\n- ૪૮ કલાક રિટર્ન વિન્ડો: જો પાક ક્ષતિગ્રસ્ત કે હલકી ગુણવત્તાનો હોય, તો ૪૮ કલાકમાં ઓર્ડરમાંથી 'Raise Dispute' કરી શકો છો.\n- ફોટો પુરાવો: ખરાબ પાકની તસવીરો અપલોડ કરો.\n- એસ્ક્રો સુરક્ષા: વિવાદ ઉકેલાય ત્યાં સુધી ચુકવણી સુરક્ષિત રહે છે અને યોગ્ય રિફંડ આપવામાં આવે છે.",
                _ => "Dispute & Refund Safeguards:\n- 48-Hour Return Window: If delivered produce is damaged or does not match the promised grade, click 'Raise Dispute' in Order Tracking within 48 hours.\n- Photo Evidence: Upload clear pictures of the affected batch.\n- Escrow Protection: Funds are frozen until resolution, and authorized admins can issue full or partial refunds."
            };
        }

        // 10. Farmer KYC & Verification
        if (text.Contains("kyc") || text.Contains("7/12") || text.Contains("aadhaar") || text.Contains("verify") || text.Contains("document") ||
            text.Contains("सत्यापन") || text.Contains("खतौनी") || text.Contains("ચકાસણી"))
        {
            return lang switch
            {
                "hi" => "किसान सत्यापन (KYC) प्रक्रिया:\n1. किसान प्रोफाइल में जाकर 'Seller Verification' खोलें।\n2. अपनी ज़मीन का 7/12 खतौनी दस्तावेज़ अपलोड करें।\n3. सरकारी पहचान पत्र (आधार कार्ड) और बैंक पासबुक / UPI विवरण जोड़ें।\n4. फार्मरबंध एडमिन द्वारा जांच के बाद आपको 'Verified Seller' का ग्रीन बैज मिल जाएगा, जिससे खरीदारों का भरोसा बढ़ता है।",
                "gu" => "ખેડૂત ચકાસણી (KYC) પ્રક્રિયા:\n૧. પ્રોફાઇલમાં 'Seller Verification' પર જાઓ.\n૨. જમીનનો ૭/૧૨ નો દાખલો અપલોડ કરો.\n૩. આધાર કાર્ડ અને બેંક પાસબુક વિગતો ઉમેરો.\n૪. એડમિન ચકાસણી પછી 'Verified Seller' બેજ મળશે, જેથી તમારો વેપાર વધશે.",
                _ => "Farmer KYC Verification Process:\n1. Go to your Seller Profile and click 'Seller Verification'.\n2. Upload your 7/12 land ownership extract or Patta document.\n3. Upload government identity proof (Aadhaar card) and bank payout details.\n4. Once reviewed by FarmerBandh administrators, you receive the official 'Verified Seller' badge."
            };
        }

        // 11. Pure Greetings (only if message doesn't contain a specific question)
        if (IsPureGreeting(text))
        {
            return lang switch
            {
                "hi" => $"नमस्ते {greetingName}! मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद। फार्मरबंध पर आपका स्वागत है! आज फसलों की खरीद-बिक्री, भाव मोलभाव (Negotiation), डिलीवरी या रेज़रपे भुगतान में आपकी क्या मदद करूँ?",
                "gu" => $"નમસ્તે {greetingName}! હું ખૂબ સરસ છું, પૂછવા બદલ આભાર. ફાર્મરબંધ પર આપનું સ્વાગત છે! પાકની ખરીદી-વેચાણ, ભાવ વાટાઘાટો અથવા રેઝરપે ચુકવણીમાં તમને કેવી રીતે મદદ કરું?",
                _ => $"Hello {greetingName}! I am doing very well, thank you for asking. Welcome to FarmerBandh! How can I assist you today with crop trading, price negotiations, delivery schedules, or Razorpay payments?"
            };
        }

        // 12. Intelligent Domain Overview Fallback
        return lang switch
        {
            "hi" => $"नमस्ते {greetingName}! मैं कृषिमित्र हूँ, फार्मरबंध का आधिकारिक AI सहायक। मैं आपकी फसल खरीदने, बेचने, भाव मोलभाव (Negotiation), रेज़रपे पेमेंट लिंक या डिलीवरी स्लॉट से जुड़े किसी भी सवाल में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?",
            "gu" => $"નમસ્તે {greetingName}! હું કૃષિમિત્ર છું, ફાર્મરબંધનું સત્તાવાર AI સહાયક. પાક ખરીદી, વેચાણ, ભાવ વાટાઘાટો (Negotiation), રેઝરપે ચુકવણી અથવા ડિલિવરી સંબંધિત કોઈપણ પ્રશ્નમાં હું મદદ કરી શકું છું. તમે શું પૂછવા માંગો છો?",
            _ => $"Hello {greetingName}! I am KrishiMitra, your FarmerBandh agrarian companion. I can assist you with buying or selling crops, negotiating rates per quintal, Razorpay or COD payments, and scheduling delivery slots. What would you like to know more about?"
        };
    }

    private static bool IsIdentityOrWorkQuery(string text)
    {
        var terms = new[]
        {
            "actual work", "what is your work", "what do you do", "who are you", "what can you do", "what can u do",
            "your work", "your purpose", "your role", "your job", "what are you", "how do you work", "explain yourself",
            "tell me about yourself", "what is krishimitra", "what is farmerbandh", "how can you help",
            "what do you do here", "actual job", "features", "your duty",
            // Hindi
            "आपका काम", "तुम्हारा काम", "क्या काम है", "क्या काम करते", "आप क्या करते", "आप कौन हैं", "तुम कौन हो",
            "कार्य क्या है", "भूमिका", "काम बताओ", "क्या कर सकते हो", "कृषिमित्र क्या है", "फार्मरबंध क्या है",
            "काम क्या", "क्या कार्य",
            // Gujarati
            "તમારું કામ", "તમે શું કામ કરો", "શું કામ છે", "તમે કોણ છો", "તમે શું કરી શકો", "તમારી ભૂમિકા",
            "તમારો ઉપયોગ", "કૃષિમિત્ર શું છે", "ફાર્મરબંધ શું છે", "કામ શું", "શું કામ"
        };

        return terms.Any(t => text.Contains(t));
    }

    private static bool IsPureGreeting(string text)
    {
        var clean = text.Replace("!", "").Replace(".", "").Replace("?", "").Trim();
        var pureGreetings = new[]
        {
            "hello", "hi", "hey", "namaste", "namaskar", "kem cho", "kaise ho", "kaisa hai", "kya haal", "kya haal hai",
            "good morning", "good evening", "good afternoon", "how are you", "how r u",
            "नमस्ते", "નમસ્તે", "કેમ છો", "કેમછો", "कैसे हो", "कैसा है"
        };

        return pureGreetings.Contains(clean);
    }

    private static bool IsExternalQuestion(string text)
    {
        var externalKeywords = new[]
        {
            "write code", "python", "javascript", "c#", "java", "react", "html", "css",
            "who is the president", "capital of", "weather in", "movie", "song", "actor",
            "cricket score", "ipl", "formula", "recipe for pizza", "tell me a joke",
            "cryptocurrency", "bitcoin", "stock market", "world war", "physics", "chemistry"
        };

        return externalKeywords.Any(k => text.Contains(k));
    }

    private static List<string> GenerateFollowUps(string lang, bool isAdmin, bool isFarmer)
    {
        if (isAdmin)
        {
            return lang switch
            {
                "hi" => new List<string> { "किसान सत्यापन कैसे करें?", "विवादों का निपटारा कैसे करें?", "प्लेटफॉर्म कमीशन सेटिंग" },
                "gu" => new List<string> { "ખેડૂત ચકાસણી કેવી રીતે કરવી?", "વિવાદોનું નિરાકરણ કેવી રીતે લાવવું?", "પ્લેટફોર્મ કમિશન સેટિંગ" },
                _ => new List<string> { "How do I verify farmer KYC?", "How do I arbitrate disputes?", "Platform fee settings" }
            };
        }

        if (isFarmer)
        {
            return lang switch
            {
                "hi" => new List<string> { "नई फसल कैसे लिस्ट करें?", "रेज़रपे पेमेंट लिंक कैसे शेयर करें?", "पेआउट बैंक खाता जोड़ना" },
                "gu" => new List<string> { "નવો પાક કેવી રીતે ઉમેરવો?", "રેઝરપે પેમેન્ટ લિંક કેવી રીતે શેર કરવી?", "બેંક ખાતું કેવી રીતે જોડવું" },
                _ => new List<string> { "How to list a new crop?", "How to share Razorpay link?", "How to add bank account for payouts?" }
            };
        }

        return lang switch
        {
            "hi" => new List<string> { "फसल के भाव पर मोलभाव कैसे करें?", "रेज़रपे से कम या ज्यादा भुगतान कैसे करें?", "डिलीवरी स्लॉट विकल्प" },
            "gu" => new List<string> { "પાકના ભાવ પર વાટાઘાટો કેવી રીતે કરવી?", "રેઝરપેથી ઓછી અથવા વધુ ચુકવણી કેવી રીતે કરવી?", "ડિલિવરી સ્લોટ વિકલ્પો" },
            _ => new List<string> { "How do I negotiate crop prices?", "How to pay less or more with Razorpay?", "What are delivery slots?" }
        };
    }
}
