namespace FarmerBandh.Domain.Entities;

/// <summary>
/// Represents a direct contact inquiry or support message submitted to the Admin team.
/// </summary>
public class ContactMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string UserType { get; set; } = "general"; // farmer, buyer, partner, general
    public string Subject { get; set; } = "General";
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, InReview, Replied, Closed
    public string? AdminNotes { get; set; }
    public string? AdminReplyText { get; set; }
    public DateTime? RepliedAt { get; set; }
    public Guid? RepliedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
