namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class UpdatePaymentStatusRequest
{
    public int PaymentStatus { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? Notes { get; set; }
}
