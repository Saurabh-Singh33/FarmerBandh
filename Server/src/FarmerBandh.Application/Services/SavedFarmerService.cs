using FarmerBandh.Application.DTOs.SavedFarmers;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Services;

public class SavedFarmerService : ISavedFarmerService
{
    private readonly ISavedFarmerRepository _savedFarmerRepository;
    private readonly IFarmerRepository _farmerRepository;
    private readonly IUserRepository _userRepository;

    public SavedFarmerService(
        ISavedFarmerRepository savedFarmerRepository,
        IFarmerRepository farmerRepository,
        IUserRepository userRepository)
    {
        _savedFarmerRepository = savedFarmerRepository;
        _farmerRepository = farmerRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<SavedFarmerDto>> GetSavedFarmersAsync(Guid buyerUserId)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) return Enumerable.Empty<SavedFarmerDto>();

        var savedList = await _savedFarmerRepository.GetByBuyerIdAsync(buyer.Id);
        var result = new List<SavedFarmerDto>();

        foreach (var sf in savedList)
        {
            var listingsCount = await _farmerRepository.GetActiveListingsCountAsync(sf.FarmerId);
            var lastOrder = await _farmerRepository.GetLastOrderDateForBuyerAsync(buyer.Id, sf.FarmerId);

            result.Add(new SavedFarmerDto
            {
                Id = sf.Id,
                FarmerId = sf.FarmerId,
                FarmName = sf.Farmer?.FarmName ?? "Farmer",
                Location = sf.Farmer?.Location ?? $"{sf.Farmer?.District}, {sf.Farmer?.State}",
                Rating = sf.Farmer?.Rating ?? 5.0m,
                Verified = (sf.Farmer?.Verified ?? 1) == 1,
                ActiveListingsCount = listingsCount,
                Note = sf.Note,
                SavedAt = sf.SavedAt,
                LastOrderAt = lastOrder
            });
        }

        return result;
    }

    public async Task<SavedFarmerDto> SaveFarmerAsync(Guid buyerUserId, SaveFarmerRequestDto request)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) throw new UnauthorizedAccessException("Buyer profile not found.");

        var farmer = await _farmerRepository.GetByIdAsync(request.FarmerId);
        if (farmer == null) throw new KeyNotFoundException("Farmer not found.");

        var existing = await _savedFarmerRepository.GetAsync(buyer.Id, request.FarmerId);
        if (existing != null)
        {
            // Idempotent: update note
            existing.Note = request.Note;
            await _savedFarmerRepository.UpdateAsync(existing);
            await _savedFarmerRepository.SaveChangesAsync();

            var listingsCount = await _farmerRepository.GetActiveListingsCountAsync(farmer.Id);
            var lastOrder = await _farmerRepository.GetLastOrderDateForBuyerAsync(buyer.Id, farmer.Id);

            return new SavedFarmerDto
            {
                Id = existing.Id,
                FarmerId = farmer.Id,
                FarmName = farmer.FarmName,
                Location = farmer.Location ?? $"{farmer.District}, {farmer.State}",
                Rating = farmer.Rating,
                Verified = farmer.Verified == 1,
                ActiveListingsCount = listingsCount,
                Note = existing.Note,
                SavedAt = existing.SavedAt,
                LastOrderAt = lastOrder
            };
        }

        var saved = new SavedFarmer
        {
            BuyerId = buyer.Id,
            FarmerId = farmer.Id,
            Note = request.Note,
            SavedAt = DateTime.UtcNow
        };

        await _savedFarmerRepository.AddAsync(saved);
        await _savedFarmerRepository.SaveChangesAsync();

        var count = await _farmerRepository.GetActiveListingsCountAsync(farmer.Id);
        var orderDate = await _farmerRepository.GetLastOrderDateForBuyerAsync(buyer.Id, farmer.Id);

        return new SavedFarmerDto
        {
            Id = saved.Id,
            FarmerId = farmer.Id,
            FarmName = farmer.FarmName,
            Location = farmer.Location ?? $"{farmer.District}, {farmer.State}",
            Rating = farmer.Rating,
            Verified = farmer.Verified == 1,
            ActiveListingsCount = count,
            Note = saved.Note,
            SavedAt = saved.SavedAt,
            LastOrderAt = orderDate
        };
    }

    public async Task RemoveSavedFarmerAsync(Guid buyerUserId, Guid farmerId)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) throw new UnauthorizedAccessException("Buyer profile not found.");

        var saved = await _savedFarmerRepository.GetAsync(buyer.Id, farmerId);
        if (saved == null) throw new KeyNotFoundException("Saved farmer bookmark not found.");

        await _savedFarmerRepository.RemoveAsync(saved);
        await _savedFarmerRepository.SaveChangesAsync();
    }

    public async Task<SavedFarmerCheckDto> CheckIsSavedAsync(Guid buyerUserId, Guid farmerId)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) return new SavedFarmerCheckDto { Saved = false };

        var isSaved = await _savedFarmerRepository.ExistsAsync(buyer.Id, farmerId);
        return new SavedFarmerCheckDto { Saved = isSaved };
    }
}
