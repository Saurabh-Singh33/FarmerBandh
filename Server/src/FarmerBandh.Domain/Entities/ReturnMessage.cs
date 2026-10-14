using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class ReturnMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReturnRequestId { get; set; }
    public Guid SenderUserId { get; set; }
    public UserRole SenderRole { get; set; }
    public string Body { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ReturnRequest? ReturnRequest { get; set; }
    public User? SenderUser { get; set; }
}
