namespace FarmerBandh.Domain.Entities;

public class ReturnItem
{
    public Guid Id { get; set; }
    public Guid ReturnRequestId { get; set; }
    public Guid OrderItemId { get; set; }
    public decimal QuantityQuintal { get; set; }
    public string? Reason { get; set; }

    // Navigation
    public ReturnRequest? ReturnRequest { get; set; }
    public OrderItem? OrderItem { get; set; }
}
