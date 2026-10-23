using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Notifications;
using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    Task<PagedResultDto<Notification>> GetUserNotificationsAsync(Guid userId, NotificationQueryParameters query);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task<Notification?> GetByIdAsync(Guid id, Guid userId);
    Task<bool> MarkReadAsync(Guid id, Guid userId);
    Task<int> MarkAllReadAsync(Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
    Task<int> ClearAsync(Guid userId, bool onlyRead);
    Task<NotificationPreference?> GetPreferencesAsync(Guid userId);
    Task<NotificationPreference> UpsertPreferencesAsync(NotificationPreference preferences);
    Task<List<Guid>> GetAdminUserIdsAsync();
}
