using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class PlatformSettingRepository : IPlatformSettingRepository
{
    private readonly AppDbContext _context;

    public PlatformSettingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PlatformSetting> GetSettingsAsync()
    {
        var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new PlatformSetting
            {
                Id = Guid.NewGuid(),
                CommissionPercent = 2.00m,
                DefaultDeliveryFee = 50.00m,
                PlatformFee = 10.00m,
                TaxPercent = 5.00m,
                CODEnabled = true,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.PlatformSettings.AddAsync(settings);
            await _context.SaveChangesAsync();
        }
        return settings;
    }
}
