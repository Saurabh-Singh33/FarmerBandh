using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Notifications;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace FarmerBandh.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(INotificationRepository repo, ILogger<NotificationService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task CreateAsync(
        Guid userId,
        NotificationType type,
        string title,
        string body,
        string? link = null,
        string? relatedEntityType = null,
        Guid? relatedEntityId = null)
    {
        try
        {
            var category = MapTypeToCategory(type);

            // 1. Check user preferences
            var prefs = await _repo.GetPreferencesAsync(userId);
            if (prefs != null && !IsCategoryEnabled(prefs, category))
            {
                _logger.LogInformation("Notification of type {Type} skipped for user {UserId} per user preferences.", type, userId);
                return;
            }

            // 2. Persist notification
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = type,
                Category = category,
                Title = title,
                Body = body,
                Link = link,
                IsRead = false,
                RelatedEntityType = relatedEntityType,
                RelatedEntityId = relatedEntityId,
                CreatedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(notification);
        }
        catch (Exception ex)
        {
            // Do not fail caller operation if notification creation errors
            _logger.LogError(ex, "Failed to create in-app notification for user {UserId} (Type: {Type})", userId, type);
        }
    }

    public async Task NotifyAdminsAsync(
        NotificationType type,
        string title,
        string body,
        string? link = null,
        string? relatedEntityType = null,
        Guid? relatedEntityId = null)
    {
        try
        {
            var adminIds = await _repo.GetAdminUserIdsAsync();
            foreach (var adminId in adminIds)
            {
                await CreateAsync(adminId, type, title, body, link, relatedEntityType, relatedEntityId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to dispatch notifications to admins (Type: {Type})", type);
        }
    }

    public async Task<PagedResultDto<NotificationDto>> GetUserNotificationsAsync(Guid userId, NotificationQueryParameters query)
    {
        var result = await _repo.GetUserNotificationsAsync(userId, query);

        return new PagedResultDto<NotificationDto>
        {
            Items = result.Items.Select(MapToDto).ToList(),
            Total = result.Total,
            Page = result.Page,
            PageSize = result.PageSize
        };
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _repo.GetUnreadCountAsync(userId);
    }

    public async Task<NotificationDto?> GetAndMarkReadAsync(Guid userId, Guid notificationId)
    {
        var item = await _repo.GetByIdAsync(notificationId, userId);
        if (item == null) return null;

        if (!item.IsRead)
        {
            await _repo.MarkReadAsync(notificationId, userId);
            item.IsRead = true;
            item.ReadAt = DateTime.UtcNow;
        }

        return MapToDto(item);
    }

    public async Task<bool> MarkReadAsync(Guid userId, Guid notificationId)
    {
        return await _repo.MarkReadAsync(notificationId, userId);
    }

    public async Task<int> MarkAllReadAsync(Guid userId)
    {
        return await _repo.MarkAllReadAsync(userId);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid notificationId)
    {
        return await _repo.DeleteAsync(notificationId, userId);
    }

    public async Task<int> ClearAsync(Guid userId, bool onlyRead)
    {
        return await _repo.ClearAsync(userId, onlyRead);
    }

    public async Task<NotificationPreferencesDto> GetPreferencesAsync(Guid userId)
    {
        var prefs = await _repo.GetPreferencesAsync(userId);
        if (prefs == null)
        {
            // Lazy provisioning with defaults
            prefs = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                OrderUpdates = true,
                NegotiationUpdates = true,
                ReturnDisputeUpdates = true,
                PayoutUpdates = true,
                VerificationUpdates = true,
                ReviewUpdates = true,
                SystemAnnouncements = true,
                UpdatedAt = DateTime.UtcNow
            };
            prefs = await _repo.UpsertPreferencesAsync(prefs);
        }

        return MapPreferencesToDto(prefs);
    }

    public async Task<NotificationPreferencesDto> UpdatePreferencesAsync(Guid userId, NotificationPreferencesDto dto)
    {
        var model = new NotificationPreference
        {
            UserId = userId,
            OrderUpdates = dto.OrderUpdates,
            NegotiationUpdates = dto.NegotiationUpdates,
            ReturnDisputeUpdates = dto.ReturnDisputeUpdates,
            PayoutUpdates = dto.PayoutUpdates,
            VerificationUpdates = dto.VerificationUpdates,
            ReviewUpdates = dto.ReviewUpdates,
            SystemAnnouncements = dto.SystemAnnouncements,
            UpdatedAt = DateTime.UtcNow
        };

        var updated = await _repo.UpsertPreferencesAsync(model);
        return MapPreferencesToDto(updated);
    }

    private static NotificationCategory MapTypeToCategory(NotificationType type) => type switch
    {
        NotificationType.ORDER_PLACED or
        NotificationType.ORDER_CONFIRMED or
        NotificationType.ORDER_PACKED or
        NotificationType.ORDER_SHIPPED or
        NotificationType.ORDER_DELIVERED or
        NotificationType.ORDER_CANCELLED => NotificationCategory.Order,

        NotificationType.NEGOTIATION_STARTED or
        NotificationType.NEGOTIATION_REPLIED or
        NotificationType.NEGOTIATION_ACCEPTED or
        NotificationType.NEGOTIATION_REJECTED or
        NotificationType.NEGOTIATION_EXPIRED => NotificationCategory.Negotiation,

        NotificationType.RETURN_REQUESTED or
        NotificationType.RETURN_APPROVED or
        NotificationType.RETURN_REJECTED or
        NotificationType.REFUND_PROCESSED or
        NotificationType.DISPUTE_OPENED or
        NotificationType.DISPUTE_MESSAGE or
        NotificationType.DISPUTE_RESOLVED => NotificationCategory.ReturnDispute,

        NotificationType.PAYOUT_REQUESTED or
        NotificationType.PAYOUT_PROCESSED or
        NotificationType.PAYOUT_FAILED => NotificationCategory.Payout,

        NotificationType.VERIFICATION_SUBMITTED or
        NotificationType.VERIFICATION_APPROVED or
        NotificationType.VERIFICATION_REJECTED => NotificationCategory.Verification,

        NotificationType.REVIEW_RECEIVED => NotificationCategory.Review,

        _ => NotificationCategory.System
    };

    private static bool IsCategoryEnabled(NotificationPreference prefs, NotificationCategory category) => category switch
    {
        NotificationCategory.Order => prefs.OrderUpdates,
        NotificationCategory.Negotiation => prefs.NegotiationUpdates,
        NotificationCategory.ReturnDispute => prefs.ReturnDisputeUpdates,
        NotificationCategory.Payout => prefs.PayoutUpdates,
        NotificationCategory.Verification => prefs.VerificationUpdates,
        NotificationCategory.Review => prefs.ReviewUpdates,
        NotificationCategory.System => prefs.SystemAnnouncements,
        _ => true
    };

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        Type = n.Type.ToString(),
        Category = n.Category.ToString(),
        Title = n.Title,
        Body = n.Body,
        Link = n.Link,
        IsRead = n.IsRead,
        ReadAt = n.ReadAt,
        RelatedEntityType = n.RelatedEntityType,
        RelatedEntityId = n.RelatedEntityId,
        CreatedAt = n.CreatedAt
    };

    private static NotificationPreferencesDto MapPreferencesToDto(NotificationPreference p) => new()
    {
        OrderUpdates = p.OrderUpdates,
        NegotiationUpdates = p.NegotiationUpdates,
        ReturnDisputeUpdates = p.ReturnDisputeUpdates,
        PayoutUpdates = p.PayoutUpdates,
        VerificationUpdates = p.VerificationUpdates,
        ReviewUpdates = p.ReviewUpdates,
        SystemAnnouncements = p.SystemAnnouncements,
        UpdatedAt = p.UpdatedAt
    };
}
