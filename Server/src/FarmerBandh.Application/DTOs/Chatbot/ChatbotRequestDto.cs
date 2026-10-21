namespace FarmerBandh.Application.DTOs.Chatbot;

public class ChatbotRequestDto
{
    public string Message { get; set; } = string.Empty;
    public string Language { get; set; } = "en"; // "en" | "hi" | "gu"
    public List<ChatMessageDto>? History { get; set; } = new();
}
