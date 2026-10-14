namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public string Grade { get; set; } = "A";
    public decimal QuantityQuintal { get; set; }
    public decimal UnitPricePerQuintal { get; set; }
    public decimal LineDiscount { get; set; }
    public decimal LineTotal { get; set; }
}
