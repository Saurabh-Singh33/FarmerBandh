namespace FarmerBandh.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public string FarmerNameSnapshot { get; set; } = string.Empty;
    public int GradeSnapshot { get; set; } = 1;
    public decimal QuantityQuintal { get; set; }
    public decimal UnitPricePerQuintal { get; set; }
    public decimal LineDiscount { get; set; } = 0;
    public decimal LineTotal { get; set; }

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
