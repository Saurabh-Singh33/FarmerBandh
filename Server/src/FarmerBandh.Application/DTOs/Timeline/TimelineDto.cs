namespace FarmerBandh.Application.DTOs.Timeline;

public class OrderStatusHistoryDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public int Status { get; set; }
    public string StatusLabel { get; set; } = string.Empty;
    public string ChangedByRole { get; set; } = string.Empty;
    public string ChangedByName { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}
