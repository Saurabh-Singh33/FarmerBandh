using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Notifications;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
    }

    public async Task<PagedResultDto<Notification>> GetUserNotificationsAsync(Guid userId, NotificationQueryParameters query)
    {
        var dbQuery = _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        if (query.UnreadOnly)
        {
            dbQuery = dbQuery.Where(n => !n.IsRead);
        }

        if (query.Category.HasValue)
        {
            dbQuery = dbQuery.Where(n => n.Category == query.Category.Value);
        }

        var total = await dbQuery.CountAsync();

        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 20 : (query.PageSize > 50 ? 50 : query.PageSize);

        var items = await dbQuery
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<Notification>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<Notification?> GetByIdAsync(Guid id, Guid userId)
    {
        return await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
    }

    public async Task<bool> MarkReadAsync(Guid id, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null) return false;

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<int> MarkAllReadAsync(Guid userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        if (unread.Count == 0) return 0;

        var now = DateTime.UtcNow;
        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }

        await _context.SaveChangesAsync();
        return unread.Count;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> ClearAsync(Guid userId, bool onlyRead)
    {
        var query = _context.Notifications.Where(n => n.UserId == userId);
        if (onlyRead)
        {
            query = query.Where(n => n.IsRead);
        }

        var items = await query.ToListAsync();
        if (items.Count == 0) return 0;

        _context.Notifications.RemoveRange(items);
        await _context.SaveChangesAsync();
        return items.Count;
    }

    public async Task<NotificationPreference?> GetPreferencesAsync(Guid userId)
    {
        return await _context.NotificationPreferences
            .FirstOrDefaultAsync(np => np.UserId == userId);
    }

    public async Task<NotificationPreference> UpsertPreferencesAsync(NotificationPreference preferences)
    {
        var existing = await _context.NotificationPreferences
            .FirstOrDefaultAsync(np => np.UserId == preferences.UserId);

        if (existing == null)
        {
            preferences.UpdatedAt = DateTime.UtcNow;
            await _context.NotificationPreferences.AddAsync(preferences);
            await _context.SaveChangesAsync();
            return preferences;
        }

        existing.OrderUpdates = preferences.OrderUpdates;
        existing.NegotiationUpdates = preferences.NegotiationUpdates;
        existing.ReturnDisputeUpdates = preferences.ReturnDisputeUpdates;
        existing.PayoutUpdates = preferences.PayoutUpdates;
        existing.VerificationUpdates = preferences.VerificationUpdates;
        existing.ReviewUpdates = preferences.ReviewUpdates;
        existing.SystemAnnouncements = preferences.SystemAnnouncements;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<List<Guid>> GetAdminUserIdsAsync()
    {
        return await _context.Users
            .Where(u => u.Role == FarmerBandh.Domain.Enums.UserRole.Admin)
            .Select(u => u.Id)
            .ToListAsync();
    }
}
