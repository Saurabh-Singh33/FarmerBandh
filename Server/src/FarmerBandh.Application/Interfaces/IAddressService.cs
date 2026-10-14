using FarmerBandh.Application.DTOs.CartAndOrders;

namespace FarmerBandh.Application.Interfaces;

public interface IAddressService
{
    Task<IEnumerable<AddressDto>> GetBuyerAddressesAsync(Guid userId);
    Task<AddressDto> CreateAddressAsync(Guid userId, CreateAddressRequest request);
    Task<AddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateAddressRequest request);
    Task DeleteAddressAsync(Guid userId, Guid addressId);
    Task SetDefaultAddressAsync(Guid userId, Guid addressId);
}
