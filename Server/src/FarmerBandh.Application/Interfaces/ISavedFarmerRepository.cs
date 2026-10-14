using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface ISavedFarmerRepository
{
    Task<SavedFarmer?> GetAsync(Guid buyerId, Guid farmerId);
    Task<IEnumerable<SavedFarmer>> GetByBuyerIdAsync(Guid buyerId);
    Task<bool> ExistsAsync(Guid buyerId, Guid farmerId);
    Task AddAsync(SavedFarmer savedFarmer);
    Task RemoveAsync(SavedFarmer savedFarmer);
    Task UpdateAsync(SavedFarmer savedFarmer);
    Task SaveChangesAsync();
}
