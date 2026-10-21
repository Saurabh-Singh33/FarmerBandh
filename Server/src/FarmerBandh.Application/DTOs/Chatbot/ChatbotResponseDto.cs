namespace FarmerBandh.Application.DTOs.Chatbot;

public class ChatbotResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public bool IsAdminMode { get; set; }
    public string? SuggestedAction { get; set; }
    public List<string>? SuggestedFollowUps { get; set; } = new();
}
