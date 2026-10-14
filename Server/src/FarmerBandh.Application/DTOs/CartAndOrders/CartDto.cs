namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class CartDto
{
    public Guid Id { get; set; }
    public string? CouponCode { get; set; }
    public decimal Subtotal { get; set; }
    public decimal BulkDiscountTotal { get; set; }
    public decimal CouponDiscountTotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public IEnumerable<CartItemDto> Items { get; set; } = new List<CartItemDto>();
}
