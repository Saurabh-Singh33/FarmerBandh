namespace FarmerBandh.Domain.Entities;

/// <summary>
/// User notification preference toggles governing which event categories trigger in-app notifications.
/// </summary>
public class NotificationPreference
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }

    public bool OrderUpdates { get; set; } = true;
    public bool NegotiationUpdates { get; set; } = true;
    public bool ReturnDisputeUpdates { get; set; } = true;
    public bool PayoutUpdates { get; set; } = true;
    public bool VerificationUpdates { get; set; } = true;
    public bool ReviewUpdates { get; set; } = true;
    public bool SystemAnnouncements { get; set; } = true;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User? User { get; set; }
}
