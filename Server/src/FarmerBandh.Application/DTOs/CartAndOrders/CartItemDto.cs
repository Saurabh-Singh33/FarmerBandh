namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerLocation { get; set; } = string.Empty;
    public decimal QuantityQuintal { get; set; }
    public decimal UnitPricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; }
    public decimal BulkDiscountPercent { get; set; }
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public decimal LineSubtotal { get; set; }
    public decimal LineDiscount { get; set; }
    public decimal LineTotal { get; set; }
}
