namespace FarmerBandh.Domain.Entities;

public class CartItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CartId { get; set; }
    public Guid ProductId { get; set; }
    public Guid FarmerId { get; set; }
    public decimal QuantityQuintal { get; set; }
    public decimal UnitPricePerQuintal { get; set; }
    public decimal BulkDiscountPercent { get; set; } = 0;
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public decimal LineSubtotal { get; set; }
    public decimal LineDiscount { get; set; } = 0;
    public decimal LineTotal { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public Cart Cart { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public Farmer Farmer { get; set; } = null!;
}
