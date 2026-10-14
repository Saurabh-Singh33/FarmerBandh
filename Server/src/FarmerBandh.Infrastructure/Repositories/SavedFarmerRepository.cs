using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class SavedFarmerRepository : ISavedFarmerRepository
{
    private readonly AppDbContext _context;

    public SavedFarmerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SavedFarmer?> GetAsync(Guid buyerId, Guid farmerId)
    {
        return await _context.SavedFarmers
            .Include(s => s.Farmer)
            .FirstOrDefaultAsync(s => s.BuyerId == buyerId && s.FarmerId == farmerId);
    }

    public async Task<IEnumerable<SavedFarmer>> GetByBuyerIdAsync(Guid buyerId)
    {
        return await _context.SavedFarmers
            .Include(s => s.Farmer)
            .Where(s => s.BuyerId == buyerId)
            .OrderByDescending(s => s.SavedAt)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(Guid buyerId, Guid farmerId)
    {
        return await _context.SavedFarmers
            .AnyAsync(s => s.BuyerId == buyerId && s.FarmerId == farmerId);
    }

    public async Task AddAsync(SavedFarmer savedFarmer)
    {
        await _context.SavedFarmers.AddAsync(savedFarmer);
    }

    public Task RemoveAsync(SavedFarmer savedFarmer)
    {
        _context.SavedFarmers.Remove(savedFarmer);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(SavedFarmer savedFarmer)
    {
        _context.SavedFarmers.Update(savedFarmer);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
