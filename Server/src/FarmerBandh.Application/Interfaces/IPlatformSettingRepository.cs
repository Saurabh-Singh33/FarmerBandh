using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IPlatformSettingRepository
{
    Task<PlatformSetting> GetSettingsAsync();
}
