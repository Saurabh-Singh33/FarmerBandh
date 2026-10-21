namespace FarmerBandh.Application.DTOs.Chatbot;

public class ChatMessageDto
{
    public string Role { get; set; } = "user"; // "user" | "assistant" | "system"
    public string Content { get; set; } = string.Empty;
}
