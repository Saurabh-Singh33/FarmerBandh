using FarmerBandh.Application.DTOs.Chatbot;

namespace FarmerBandh.Application.Interfaces;

public interface IChatbotService
{
    Task<ChatbotResponseDto> ProcessMessageAsync(ChatbotRequestDto request, string? userRole, string? userName);
}
