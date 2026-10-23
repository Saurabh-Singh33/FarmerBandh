using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Notifications;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Interfaces;

public interface INotificationService
{
    /// <summary>
    /// Safely writes an in-app notification if the recipient's category preferences allow it.
    /// Does not throw to avoid failing parent business operations.
    /// </summary>
    Task CreateAsync(
        Guid userId,
        NotificationType type,
        string title,
        string body,
        string? link = null,
        string? relatedEntityType = null,
        Guid? relatedEntityId = null
    );

    Task NotifyAdminsAsync(
        NotificationType type,
        string title,
        string body,
        string? link = null,
        string? relatedEntityType = null,
        Guid? relatedEntityId = null
    );

    Task<PagedResultDto<NotificationDto>> GetUserNotificationsAsync(Guid userId, NotificationQueryParameters query);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task<NotificationDto?> GetAndMarkReadAsync(Guid userId, Guid notificationId);
    Task<bool> MarkReadAsync(Guid userId, Guid notificationId);
    Task<int> MarkAllReadAsync(Guid userId);
    Task<bool> DeleteAsync(Guid userId, Guid notificationId);
    Task<int> ClearAsync(Guid userId, bool onlyRead);
    Task<NotificationPreferencesDto> GetPreferencesAsync(Guid userId);
    Task<NotificationPreferencesDto> UpdatePreferencesAsync(Guid userId, NotificationPreferencesDto dto);
}
