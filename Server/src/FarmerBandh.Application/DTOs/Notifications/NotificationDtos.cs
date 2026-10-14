using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.DTOs.Notifications;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NotificationPreferencesDto
{
    public bool OrderUpdates { get; set; } = true;
    public bool NegotiationUpdates { get; set; } = true;
    public bool ReturnDisputeUpdates { get; set; } = true;
    public bool PayoutUpdates { get; set; } = true;
    public bool VerificationUpdates { get; set; } = true;
    public bool ReviewUpdates { get; set; } = true;
    public bool SystemAnnouncements { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class NotificationQueryParameters
{
    public bool UnreadOnly { get; set; } = false;
    public NotificationCategory? Category { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class NotificationUnreadCountResponse
{
    public int Count { get; set; }
}

public class MarkAllReadResponse
{
    public int Marked { get; set; }
}

public class DeleteNotificationsResponse
{
    public int Deleted { get; set; }
}
