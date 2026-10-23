using FarmerBandh.Application.DTOs.Seller;

namespace FarmerBandh.Application.Interfaces;

public interface ISellerProfileService
{
    Task<SellerProfileDto> GetProfileAsync(Guid userId);
    Task<SellerProfileDto> UpdateProfileAsync(Guid userId, UpdateSellerProfileRequest request);
    Task ChangePasswordAsync(Guid userId, ChangeSellerPasswordRequest request);
    Task<SellerSettingsDto> GetSettingsAsync(Guid userId);
    Task<SellerSettingsDto> UpdateSettingsAsync(Guid userId, UpdateSellerSettingsRequest request);
    Task DeleteAccountAsync(Guid userId, DeleteSellerAccountRequest request);
}
