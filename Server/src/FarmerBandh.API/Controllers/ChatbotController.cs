using System.Security.Claims;
using FarmerBandh.Application.DTOs.Chatbot;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/chatbot")]
public class ChatbotController : ControllerBase
{
    private readonly IChatbotService _chatbotService;
    private readonly IHttpClientFactory _httpClientFactory;

    public ChatbotController(IChatbotService chatbotService, IHttpClientFactory httpClientFactory)
    {
        _chatbotService = chatbotService;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("tts")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetTtsAudio([FromQuery] string text, [FromQuery] string lang = "gu")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return BadRequest(new { message = "Text parameter is required." });
        }

        var cleanText = text.Length > 250 ? text.Substring(0, 250) : text;
        var encoded = Uri.EscapeDataString(cleanText);
        var targetLang = string.IsNullOrWhiteSpace(lang) ? "gu" : lang.ToLowerInvariant();
        var url = $"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={targetLang}&q={encoded}";

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(8);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            var response = await client.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                var bytes = await response.Content.ReadAsByteArrayAsync();
                return File(bytes, "audio/mpeg");
            }
        }
        catch
        {
            // Fall through to 404
        }

        return NotFound();
    }

    [HttpPost("chat")]
    public async Task<ActionResult<ChatbotResponseDto>> Chat([FromBody] ChatbotRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Message content cannot be empty." });
        }

        // Determine user identity and role from claims if logged in
        string? userRole = User.FindFirst(ClaimTypes.Role)?.Value
            ?? User.FindFirst("role")?.Value;

        string? userName = null;

        // 1. Check request payload if explicitly provided by client AuthContext
        if (!string.IsNullOrWhiteSpace(request.UserName) && !request.UserName.Contains('@'))
        {
            userName = request.UserName.Trim();
        }

        // 2. Check JWT Claims
        if (string.IsNullOrWhiteSpace(userName))
        {
            userName = User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst("fullName")?.Value
                ?? User.FindFirst("name")?.Value;
        }

        // 3. Fallback to email cleaning: never expose raw @gmail.com
        if (string.IsNullOrWhiteSpace(userName) || userName.Contains('@'))
        {
            var rawEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? request.UserName;
            if (!string.IsNullOrWhiteSpace(rawEmail) && rawEmail.Contains('@'))
            {
                userName = FormatFriendlyNameFromEmail(rawEmail);
            }
        }

        if (string.IsNullOrWhiteSpace(userRole))
        {
            userRole = "Guest";
        }

        var result = await _chatbotService.ProcessMessageAsync(request, userRole, userName);
        return Ok(result);
    }

    private static string FormatFriendlyNameFromEmail(string email)
    {
        try
        {
            var prefix = email.Split('@')[0];
            // Remove all trailing numbers (e.g. singhsaurbh43431 -> singhsaurbh)
            var lettersOnly = System.Text.RegularExpressions.Regex.Replace(prefix, @"[\d_\.\-]+", " ").Trim();
            if (string.IsNullOrWhiteSpace(lettersOnly))
            {
                return "Kisan Mitra";
            }

            // Capitalize each word
            return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(lettersOnly.ToLowerInvariant());
        }
        catch
        {
            return "Kisan Mitra";
        }
    }
}
