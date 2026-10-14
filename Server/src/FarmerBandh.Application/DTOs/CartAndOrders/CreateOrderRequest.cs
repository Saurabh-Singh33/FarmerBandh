namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class CreateOrderRequest
{
    public Guid AddressId { get; set; }
    public DateTime DeliverySlotDate { get; set; }
    public string DeliverySlotWindow { get; set; } = string.Empty;
    public int PaymentMethod { get; set; } = 4;
    public string? CouponCode { get; set; }
}
