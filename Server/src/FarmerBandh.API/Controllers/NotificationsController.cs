using System.Security.Claims;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Notifications;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// Lists the current authenticated user's in-app notifications with optional unread and category filters.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<NotificationDto>>> GetNotifications([FromQuery] NotificationQueryParameters query)
    {
        var userId = GetCurrentUserId();
        var result = await _notificationService.GetUserNotificationsAsync(userId, query);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the total unread notification count across all categories for the current user.
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<ActionResult<NotificationUnreadCountResponse>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new NotificationUnreadCountResponse { Count = count });
    }

    /// <summary>
    /// Retrieves a single notification and automatically marks it as read.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NotificationDto>> GetNotification(Guid id)
    {
        var userId = GetCurrentUserId();
        var item = await _notificationService.GetAndMarkReadAsync(userId, id);
        if (item == null)
        {
            return NotFound(new { message = "Notification not found." });
        }
        return Ok(item);
    }

    /// <summary>
    /// Explicitly marks a specific notification as read.
    /// </summary>
    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = GetCurrentUserId();
        var success = await _notificationService.MarkReadAsync(userId, id);
        if (!success)
        {
            return NotFound(new { message = "Notification not found." });
        }
        return NoContent();
    }

    /// <summary>
    /// Marks all unread notifications as read for the current user.
    /// </summary>
    [HttpPost("read-all")]
    public async Task<ActionResult<MarkAllReadResponse>> MarkAllRead()
    {
        var userId = GetCurrentUserId();
        var marked = await _notificationService.MarkAllReadAsync(userId);
        return Ok(new MarkAllReadResponse { Marked = marked });
    }

    /// <summary>
    /// Deletes a single notification belonging to the current user.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var userId = GetCurrentUserId();
        var deleted = await _notificationService.DeleteAsync(userId, id);
        if (!deleted)
        {
            return NotFound(new { message = "Notification not found." });
        }
        return NoContent();
    }

    /// <summary>
    /// Clears notifications for the current user, optionally filtering to only read items.
    /// </summary>
    [HttpDelete]
    public async Task<ActionResult<DeleteNotificationsResponse>> ClearNotifications([FromQuery] bool onlyRead = true)
    {
        var userId = GetCurrentUserId();
        var deleted = await _notificationService.ClearAsync(userId, onlyRead);
        return Ok(new DeleteNotificationsResponse { Deleted = deleted });
    }

    /// <summary>
    /// Retrieves notification preference toggles for the current user, lazily initializing defaults if missing.
    /// </summary>
    [HttpGet("preferences")]
    public async Task<ActionResult<NotificationPreferencesDto>> GetPreferences()
    {
        var userId = GetCurrentUserId();
        var prefs = await _notificationService.GetPreferencesAsync(userId);
        return Ok(prefs);
    }

    /// <summary>
    /// Updates category notification preferences for the current user.
    /// </summary>
    [HttpPut("preferences")]
    public async Task<ActionResult<NotificationPreferencesDto>> UpdatePreferences([FromBody] NotificationPreferencesDto request)
    {
        var userId = GetCurrentUserId();
        var updated = await _notificationService.UpdatePreferencesAsync(userId, request);
        return Ok(updated);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
        {
            throw new UnauthorizedAccessException("User identification token is missing or malformed.");
        }

        return userId;
    }
}
