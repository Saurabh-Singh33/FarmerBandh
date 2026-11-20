namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class RecordPaymentRequest
{
    public decimal Amount { get; set; }
    public string? PaymentId { get; set; }
    public string? PaymentLinkId { get; set; } = "plink_U2CqOn54TpAx8O";
    public string? PaymentLinkUrl { get; set; } = "https://razorpay.com/payment-link/plink_U2CqOn54TpAx8O/test";
    public int? PaymentMethod { get; set; } = 5;
}
