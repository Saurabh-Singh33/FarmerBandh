using FarmerBandh.Application.DTOs.SavedFarmers;

namespace FarmerBandh.Application.Interfaces;

public interface ISavedFarmerService
{
    Task<IEnumerable<SavedFarmerDto>> GetSavedFarmersAsync(Guid buyerUserId);
    Task<SavedFarmerDto> SaveFarmerAsync(Guid buyerUserId, SaveFarmerRequestDto request);
    Task RemoveSavedFarmerAsync(Guid buyerUserId, Guid farmerId);
    Task<SavedFarmerCheckDto> CheckIsSavedAsync(Guid buyerUserId, Guid farmerId);
}
