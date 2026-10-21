namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class RecordPaymentRequest
{
    public decimal Amount { get; set; }
    public string? PaymentId { get; set; }
    public string? PaymentLinkId { get; set; } = "plink_Tqe4bgUXaopgZ0";
    public string? PaymentLinkUrl { get; set; } = "https://rzp.io/rzp/MkpDZkX";
    public int? PaymentMethod { get; set; } = 5;
}
