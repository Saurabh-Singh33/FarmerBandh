namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class CreateOrderRequest
{
    public Guid AddressId { get; set; }
    public DateTime DeliverySlotDate { get; set; }
    public string DeliverySlotWindow { get; set; } = string.Empty;
    public int PaymentMethod { get; set; } = 4;
    public string? CouponCode { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? PaymentId { get; set; }
    public string? PaymentLinkId { get; set; }
}
