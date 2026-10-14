namespace FarmerBandh.Domain.Entities;

public class PlatformSetting
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public decimal CommissionPercent { get; set; } = 2.00m;
    public decimal DefaultDeliveryFee { get; set; } = 50.00m;
    public decimal PlatformFee { get; set; } = 10.00m;
    public decimal TaxPercent { get; set; } = 5.00m;
    public bool CODEnabled { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool MaintenanceModeEnabled { get; set; } = false;
    public bool NewRegistrationsEnabled { get; set; } = true;
    public bool NegotiationsEnabled { get; set; } = true;
    public bool VerifiedOnlyMarketplace { get; set; } = false;
    public int MaxDeliverySlotsPerDay { get; set; } = 5;
    public string? SupportEmail { get; set; } = "support@farmerbandh.com";
    public string? SupportPhone { get; set; } = "1800123456";
    public Guid? UpdatedByUserId { get; set; }

    public User? UpdatedByUser { get; set; }
}
