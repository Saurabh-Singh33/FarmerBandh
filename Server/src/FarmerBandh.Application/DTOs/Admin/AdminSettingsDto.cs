namespace FarmerBandh.Application.DTOs.Admin;

public class AdminPlatformSettingsDto
{
    public Guid Id { get; set; }
    public decimal CommissionPercent { get; set; }
    public decimal DefaultDeliveryFee { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal TaxPercent { get; set; }
    public bool CODEnabled { get; set; }
    public bool MaintenanceModeEnabled { get; set; }
    public bool NewRegistrationsEnabled { get; set; }
    public bool NegotiationsEnabled { get; set; }
    public bool VerifiedOnlyMarketplace { get; set; }
    public int MaxDeliverySlotsPerDay { get; set; }
    public string? SupportEmail { get; set; }
    public string? SupportPhone { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? UpdatedByName { get; set; }
}

public class UpdatePlatformSettingsRequest
{
    public decimal CommissionPercent { get; set; }
    public decimal DefaultDeliveryFee { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal TaxPercent { get; set; }
    public bool CODEnabled { get; set; }
    public bool MaintenanceModeEnabled { get; set; }
    public bool NewRegistrationsEnabled { get; set; }
    public bool NegotiationsEnabled { get; set; }
    public bool VerifiedOnlyMarketplace { get; set; }
    public int MaxDeliverySlotsPerDay { get; set; }
    public string? SupportEmail { get; set; }
    public string? SupportPhone { get; set; }
}
