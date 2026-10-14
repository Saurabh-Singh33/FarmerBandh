using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class VerificationRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FarmerId { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public string? AadhaarNumber { get; set; }
    public string? LandRecordUrl { get; set; }
    public string? SelfieUrl { get; set; }
    public string? Notes { get; set; }
    public VerificationRequestStatus Status { get; set; } = VerificationRequestStatus.Pending;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public string? RejectionReason { get; set; }

    public Farmer Farmer { get; set; } = null!;
    public User? ReviewedByUser { get; set; }
}
