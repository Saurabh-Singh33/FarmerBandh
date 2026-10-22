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
        var lang = NormalizeLanguage(request.Language);
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
            ?? "minimax/minimax-m3.1-flash:free";

        var candidateModels = new List<string> { preferredModel.Trim() };
        if (!candidateModels.Contains("minimax/minimax-m3.1-flash:free"))
            candidateModels.Add("minimax/minimax-m3.1-flash:free");
        if (!candidateModels.Contains("liquid/lfm-2.5-2.6b:free"))
            candidateModels.Add("liquid/lfm-2.5-2.6b:free");
        if (!candidateModels.Contains("nvidia/nemotron-3.5-lightning:free"))
            candidateModels.Add("nvidia/nemotron-3.5-lightning:free");

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

                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(15));
                var response = await client.SendAsync(httpRequest, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    var errBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("OpenRouter model {Model} returned HTTP {StatusCode}: {ErrorBody}. Trying next candidate if available.", model, response.StatusCode, errBody);
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

        // 0. Format clean greeting name
        var greetingName = !string.IsNullOrWhiteSpace(userName) && !userName.Contains('@')
            ? userName
            : (isAdmin ? "Admin" : (isFarmer ? "किसान मित्र" : "मित्र"));

        // 1. External question check
        if (IsExternalQuestion(text))
        {
            return lang switch
            {
                "hi" => "नमस्ते! मैं कृषिमित्र हूँ, फार्मरबंध का समर्पित एआई सहायक। मैं केवल फार्मरबंध प्लेटफॉर्म, फसलों, ऑर्डर, भुगतान और कृषि व्यापार से संबंधित प्रश्नों में ही आपकी सहायता कर सकता हूँ। बाहरी प्रश्नों का उत्तर देना मेरे कार्यक्षेत्र से बाहर है।",
                "gu" => "નમસ્તે! હું કૃષિમિત્ર છું, ફાર્મરબંધનું સમર્પિત AI સહાયક. હું ફક્ત ફાર્મરબંધ પ્લેટફોર્મ, પાકો, ઓર્ડર, ચુકવણી અને કૃષિ વેપાર સંબંધિત પ્રશ્નોમાં જ તમને મદદ કરી શકું છું. બહારના પ્રશ્નોનો જવાબ આપવો મારા કાર્યક્ષેત્ર બહાર છે.",
                _ => "Hello! I am KrishiMitra, the dedicated FarmerBandh AI companion. I can only assist with questions directly related to the FarmerBandh agrarian platform, crop marketplace, orders, Razorpay payments, and farm operations. External topics are outside my scope."
            };
        }

        // 2. Greeting check (e.g. "कैसे हो", "kaise ho", "how are you", "hello", "namaste")
        if (text.Contains("कैसे हो") || text.Contains("kaise ho") || text.Contains("kaisa hai") || 
            text.Contains("how are you") || text.Contains("kem cho") || text.Contains("kya haal") ||
            text == "hello" || text == "hi" || text == "namaste" || text == "नमस्ते" || text == "નમસ્તે")
        {
            return lang switch
            {
                "hi" => $"नमस्ते {greetingName}! मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद। फार्मरबंध पर आपका स्वागत है! आज फसलों की खरीद-बिक्री, भाव मोलभाव (Negotiation), डिलीवरी या रेज़रपे भुगतान में आपकी क्या मदद करूँ?",
                "gu" => $"નમસ્તે {greetingName}! હું ખૂબ સરસ છું, પૂછવા બદલ આભાર. ફાર્મરબંધ પર આપનું સ્વાગત છે! પાકની ખરીદી-વેચાણ, ભાવ વાટાઘાટો અથવા રેઝરપે ચુકવણીમાં તમને કેવી રીતે મદદ કરું?",
                _ => $"Hello {greetingName}! I am doing very well, thank you for asking. Welcome to FarmerBandh! How can I assist you today with crop trading, price negotiations, delivery schedules, or Razorpay payments?"
            };
        }

        // 3. Admin queries check
        if (text.Contains("admin") || text.Contains("verify") || text.Contains("kyc") || text.Contains("arbitrat") || text.Contains("payout") || text.Contains("approve"))
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

        // 4. Payment & Razorpay Link
        if (text.Contains("pay") || text.Contains("razorpay") || text.Contains("upi") || text.Contains("link") || text.Contains("100000") || text.Contains("rupee") || text.Contains("पैसे") || text.Contains("भुगतान") || text.Contains("ચુકવણી"))
        {
            return lang switch
            {
                "hi" => "फार्मरबंध रेज़रपे पेमेंट लिंक (plink_Tqe4bgUXaopgZ0 / https://rzp.io/rzp/MkpDZkX) का समर्थन करता है। खरीदार चेकआउट या ऑर्डर हिस्ट्री से यूपीआई, कार्ड या नेटबैंकिंग द्वारा ₹1,00,000 या अपनी इच्छानुसार कम/ज्यादा अग्रिम टोकन राशि आसानी से चुका सकते हैं।",
                "gu" => "ફાર્મરબંધ રેઝરપે પેમેન્ટ લિંક (plink_Tqe4bgUXaopgZ0 / https://rzp.io/rzp/MkpDZkX) ને સપોર્ટ કરે છે. ખરીદદારો ચેકઆઉટ અથવા ઓર્ડર હિસ્ટ્રીમાંથી UPI, કાર્ડ અથવા નેટબેંકિંગ દ્વારા ₹1,00,000 અથવા પોતાની ઈચ્છા મુજબ ઓછી/વધુ રકમ ચૂકવી શકે છે.",
                _ => "FarmerBandh supports Razorpay Payment Link (Link ID: plink_Tqe4bgUXaopgZ0, https://rzp.io/rzp/MkpDZkX). Buyers can pay the default ₹100,000 or any custom flexible amount (less or more than ₹100,000) using UPI, Cards, NetBanking, or COD directly at checkout or in Order Tracking."
            };
        }

        // 5. Crop Marketplace & Price Bargaining / Negotiation
        if (text.Contains("फसल") || text.Contains("भाव") || text.Contains("रेट") || text.Contains("मोलभाव") || 
            text.Contains("rate") || text.Contains("price") || text.Contains("negotiat") || text.Contains("bargain") ||
            text.Contains("गेहूं") || text.Contains("चावल") || text.Contains("आलू") || text.Contains("प्याज") || 
            text.Contains("લહસન") || text.Contains("પાક") || text.Contains("ભાવ"))
        {
            return lang switch
            {
                "hi" => "फार्मरबंध पर सभी फसलें क्विंटल (1 क्विंटल = 100 किग्रा) में बिकती हैं। आप 'Marketplace' में जाकर मनपसंद फसल खोज सकते हैं, उसकी गुणवत्ता (Grade A, B, C) देख सकते हैं, और 'Negotiate Price' बटन दबाकर सीधे किसान से अपने मनपसंद भाव पर बातचीत कर सकते हैं।",
                "gu" => "ફાર્મરબંધ પર તમામ પાક ક્વિન્ટલમાં વેચાય છે. તમે 'Marketplace' માં જઈને પાક શોધી શકો છો, ગ્રેડ (A, B, C) ચકાસી શકો છો, અને 'Negotiate Price' બટન દબાવીને સીધા ખેડૂત સાથે ભાવ વાટાઘાટો કરી શકો છો.",
                _ => "All crops on FarmerBandh are traded in quintals (1 quintal = 100 kg) across Grade A, B, and C. You can browse produce in Marketplace and click 'Negotiate Price' to submit a custom price offer directly to the farmer."
            };
        }

        // 6. Default greetings / platform overview
        return lang switch
        {
            "hi" => $"नमस्ते {greetingName}! मैं फार्मरबंध सहायक हूँ। मैं आपको फसल खरीदने/बेचने, भाव मोलभाव (Negotiation), डिलीवरी स्लॉट, और रेज़रपे भुगतान में कैसे मदद कर सकता हूँ?",
            "gu" => $"નમસ્તે {greetingName}! હું ફાર્મરબંધ સહાયક છું. પાક ખરીદવા/વેચવા, ભાવ વાટાઘાટો (Negotiation), ડિલિવરી સ્લોટ અને રેઝરપે ચુકવણી વિશે તમે મને પૂછી શકો છો.",
            _ => $"Hello {greetingName}! I am KrishiMitra, your FarmerBandh assistant. How can I help you with crop listings, price negotiations, delivery schedules, or Razorpay payments today?"
        };
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
