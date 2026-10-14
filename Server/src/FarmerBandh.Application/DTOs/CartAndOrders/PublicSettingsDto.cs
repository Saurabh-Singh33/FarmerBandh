namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class PublicSettingsDto
{
    public decimal CommissionPercent { get; set; }
    public decimal DefaultDeliveryFee { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal TaxPercent { get; set; }
    public bool CODEnabled { get; set; }
}
