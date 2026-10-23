using FarmerBandh.Application.DTOs.Buyer;

namespace FarmerBandh.Application.Interfaces;

public interface IBuyerProfileService
{
    Task<BuyerProfileDto> GetProfileAsync(Guid userId);
    Task<BuyerProfileDto> UpdateProfileAsync(Guid userId, UpdateBuyerProfileRequest request);
    Task ChangePasswordAsync(Guid userId, ChangeBuyerPasswordRequest request);
}
