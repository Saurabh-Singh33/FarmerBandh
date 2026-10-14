using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IAddressRepository
{
    Task<IEnumerable<Address>> GetBuyerAddressesAsync(Guid buyerId);
    Task<Address?> GetByIdAsync(Guid id);
    Task<Address> CreateAsync(Address address);
    Task UpdateAsync(Address address);
    Task DeleteAsync(Address address);
    Task SetDefaultAsync(Guid buyerId, Guid addressId);
}
