using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Contact;

namespace FarmerBandh.Application.Interfaces;

public interface IContactService
{
    Task<ContactMessageResponseDto> SubmitMessageAsync(CreateContactMessageDto dto);
    Task<PagedResultDto<ContactMessageResponseDto>> GetMessagesAsync(ContactQueryParameters query);
    Task<ContactMessageResponseDto?> GetMessageByIdAsync(Guid id);
    Task<ContactMessageResponseDto?> UpdateStatusAsync(Guid id, UpdateContactStatusDto dto);
    Task<ContactMessageResponseDto?> ReplyToMessageAsync(Guid id, Guid adminUserId, ReplyContactMessageDto dto);
    Task<bool> DeleteMessageAsync(Guid id);
}
