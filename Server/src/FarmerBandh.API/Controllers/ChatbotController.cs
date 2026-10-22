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

    public ChatbotController(IChatbotService chatbotService)
    {
        _chatbotService = chatbotService;
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
