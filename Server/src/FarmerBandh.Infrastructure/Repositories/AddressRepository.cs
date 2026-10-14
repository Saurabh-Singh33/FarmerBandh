using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class AddressRepository : IAddressRepository
{
    private readonly AppDbContext _context;

    public AddressRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Address>> GetBuyerAddressesAsync(Guid buyerId)
    {
        return await _context.Addresses
            .AsNoTracking()
            .Where(a => a.BuyerId == buyerId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<Address?> GetByIdAsync(Guid id)
    {
        return await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Address> CreateAsync(Address address)
    {
        if (address.IsDefault)
        {
            await UnsetDefaultAddressesAsync(address.BuyerId);
        }

        await _context.Addresses.AddAsync(address);
        await _context.SaveChangesAsync();
        return address;
    }

    public async Task UpdateAsync(Address address)
    {
        if (address.IsDefault)
        {
            await UnsetDefaultAddressesAsync(address.BuyerId, address.Id);
        }

        address.UpdatedAt = DateTime.UtcNow;
        _context.Addresses.Update(address);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Address address)
    {
        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();
    }

    public async Task SetDefaultAsync(Guid buyerId, Guid addressId)
    {
        var addresses = await _context.Addresses.Where(a => a.BuyerId == buyerId).ToListAsync();
        foreach (var addr in addresses)
        {
            addr.IsDefault = (addr.Id == addressId);
            addr.UpdatedAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
    }

    private async Task UnsetDefaultAddressesAsync(Guid buyerId, Guid? excludeId = null)
    {
        var defaults = await _context.Addresses
            .Where(a => a.BuyerId == buyerId && a.IsDefault && (!excludeId.HasValue || a.Id != excludeId.Value))
            .ToListAsync();

        foreach (var a in defaults)
        {
            a.IsDefault = false;
        }
    }
}
