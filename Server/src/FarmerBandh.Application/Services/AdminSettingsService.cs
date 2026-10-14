using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminSettingsService : IAdminSettingsService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminSettingsService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<AdminPlatformSettingsDto> GetSettingsAsync()
    {
        var s = await _adminRepository.GetPlatformSettingsAsync();

        return new AdminPlatformSettingsDto
        {
            Id = s.Id,
            CommissionPercent = s.CommissionPercent,
            DefaultDeliveryFee = s.DefaultDeliveryFee,
            PlatformFee = s.PlatformFee,
            TaxPercent = s.TaxPercent,
            CODEnabled = s.CODEnabled,
            MaintenanceModeEnabled = s.MaintenanceModeEnabled,
            NewRegistrationsEnabled = s.NewRegistrationsEnabled,
            NegotiationsEnabled = s.NegotiationsEnabled,
            VerifiedOnlyMarketplace = s.VerifiedOnlyMarketplace,
            MaxDeliverySlotsPerDay = s.MaxDeliverySlotsPerDay,
            SupportEmail = s.SupportEmail,
            SupportPhone = s.SupportPhone,
            UpdatedAt = s.UpdatedAt,
            UpdatedByName = s.UpdatedByUser?.FullName
        };
    }

    public async Task<bool> UpdateSettingsAsync(UpdatePlatformSettingsRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var s = await _adminRepository.GetPlatformSettingsAsync();

        var beforeJson = $"{{\"commission\":{s.CommissionPercent},\"delivery\":{s.DefaultDeliveryFee},\"platformFee\":{s.PlatformFee},\"tax\":{s.TaxPercent},\"cod\":{s.CODEnabled.ToString().ToLower()},\"maintenance\":{s.MaintenanceModeEnabled.ToString().ToLower()}}}";

        s.CommissionPercent = request.CommissionPercent;
        s.DefaultDeliveryFee = request.DefaultDeliveryFee;
        s.PlatformFee = request.PlatformFee;
        s.TaxPercent = request.TaxPercent;
        s.CODEnabled = request.CODEnabled;
        s.MaintenanceModeEnabled = request.MaintenanceModeEnabled;
        s.NewRegistrationsEnabled = request.NewRegistrationsEnabled;
        s.NegotiationsEnabled = request.NegotiationsEnabled;
        s.VerifiedOnlyMarketplace = request.VerifiedOnlyMarketplace;
        s.MaxDeliverySlotsPerDay = request.MaxDeliverySlotsPerDay;
        s.SupportEmail = request.SupportEmail;
        s.SupportPhone = request.SupportPhone;
        s.UpdatedByUserId = currentAdminId;
        s.UpdatedAt = DateTime.UtcNow;

        await _adminRepository.UpdatePlatformSettingsAsync(s);
        await _adminRepository.SaveChangesAsync();

        var afterJson = $"{{\"commission\":{s.CommissionPercent},\"delivery\":{s.DefaultDeliveryFee},\"platformFee\":{s.PlatformFee},\"tax\":{s.TaxPercent},\"cod\":{s.CODEnabled.ToString().ToLower()},\"maintenance\":{s.MaintenanceModeEnabled.ToString().ToLower()}}}";

        await _activityLogger.LogAsync(
            action: "SETTINGS_UPDATED",
            targetType: "Settings",
            targetId: s.Id,
            summary: "Updated platform settings configuration",
            metadata: $"{{\"before\":{beforeJson},\"after\":{afterJson}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
