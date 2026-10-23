using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Contact;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace FarmerBandh.Application.Services;

public class ContactService : IContactService
{
    private readonly IContactRepository _contactRepo;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<ContactService> _logger;

    public ContactService(
        IContactRepository contactRepo,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<ContactService> logger)
    {
        _contactRepo = contactRepo;
        _emailService = emailService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<ContactMessageResponseDto> SubmitMessageAsync(CreateContactMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Name is required.", nameof(dto.Name));

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ArgumentException("Email is required.", nameof(dto.Email));

        if (string.IsNullOrWhiteSpace(dto.Message))
            throw new ArgumentException("Message is required.", nameof(dto.Message));

        var message = new ContactMessage
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
            UserType = string.IsNullOrWhiteSpace(dto.UserType) ? "general" : dto.UserType.Trim().ToLowerInvariant(),
            Subject = string.IsNullOrWhiteSpace(dto.Subject) ? "General" : dto.Subject.Trim(),
            Message = dto.Message.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var saved = await _contactRepo.AddAsync(message);

        // 1. Send in-app notification to all platform Administrators
        try
        {
            var preview = message.Message.Length > 80 ? message.Message[..80] + "..." : message.Message;
            await _notificationService.NotifyAdminsAsync(
                NotificationType.SYSTEM_ANNOUNCEMENT,
                $"New Contact Query: {message.Name} ({message.UserType})",
                $"{message.Subject}: {preview}",
                "/admin/contacts",
                "ContactMessage",
                saved.Id
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send in-app notification to admins for contact message {MessageId}", saved.Id);
        }

        // 2. Dispatch email alerts asynchronously (Admin alert + User acknowledgment)
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendContactInquiryAdminAlertAsync(saved);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending admin email alert for contact message {MessageId}", saved.Id);
            }

            try
            {
                await _emailService.SendContactInquiryAcknowledgmentAsync(saved);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending user acknowledgment email for contact message {MessageId}", saved.Id);
            }
        });

        return MapToDto(saved);
    }

    public async Task<PagedResultDto<ContactMessageResponseDto>> GetMessagesAsync(ContactQueryParameters query)
    {
        var (items, total) = await _contactRepo.GetAllAsync(
            query.Search,
            query.Status,
            query.UserType,
            query.Page,
            query.PageSize);

        return new PagedResultDto<ContactMessageResponseDto>
        {
            Items = items.Select(MapToDto).ToList(),
            Total = total,
            Page = query.Page <= 0 ? 1 : query.Page,
            PageSize = query.PageSize <= 0 ? 20 : query.PageSize
        };
    }

    public async Task<ContactMessageResponseDto?> GetMessageByIdAsync(Guid id)
    {
        var item = await _contactRepo.GetByIdAsync(id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<ContactMessageResponseDto?> UpdateStatusAsync(Guid id, UpdateContactStatusDto dto)
    {
        var item = await _contactRepo.GetByIdAsync(id);
        if (item == null) return null;

        item.Status = dto.Status.Trim();
        if (dto.AdminNotes != null)
        {
            item.AdminNotes = dto.AdminNotes;
        }

        var updated = await _contactRepo.UpdateAsync(item);
        return MapToDto(updated);
    }

    public async Task<ContactMessageResponseDto?> ReplyToMessageAsync(Guid id, Guid adminUserId, ReplyContactMessageDto dto)
    {
        var item = await _contactRepo.GetByIdAsync(id);
        if (item == null) return null;

        if (string.IsNullOrWhiteSpace(dto.ReplyText))
            throw new ArgumentException("Reply text cannot be empty.", nameof(dto.ReplyText));

        item.AdminReplyText = dto.ReplyText.Trim();
        item.RepliedAt = DateTime.UtcNow;
        item.RepliedByUserId = adminUserId;
        item.Status = "Replied";

        if (dto.AdminNotes != null)
        {
            item.AdminNotes = dto.AdminNotes;
        }

        var updated = await _contactRepo.UpdateAsync(item);

        // Dispatch email reply asynchronously
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendAdminReplyToUserAsync(updated, dto.ReplyText.Trim());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error dispatching admin reply email to {Email} for message {MessageId}", updated.Email, updated.Id);
            }
        });

        return MapToDto(updated);
    }

    public async Task<bool> DeleteMessageAsync(Guid id)
    {
        return await _contactRepo.DeleteAsync(id);
    }

    private static ContactMessageResponseDto MapToDto(ContactMessage c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Email = c.Email,
        Phone = c.Phone,
        UserType = c.UserType,
        Subject = c.Subject,
        Message = c.Message,
        Status = c.Status,
        AdminNotes = c.AdminNotes,
        AdminReplyText = c.AdminReplyText,
        RepliedAt = c.RepliedAt,
        RepliedByUserId = c.RepliedByUserId,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
