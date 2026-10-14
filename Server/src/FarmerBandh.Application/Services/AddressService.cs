using FarmerBandh.Application.DTOs.CartAndOrders;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Services;

public class AddressService : IAddressService
{
    private readonly IAddressRepository _addressRepository;
    private readonly IProductRepository _productRepository;

    public AddressService(IAddressRepository addressRepository, IProductRepository productRepository)
    {
        _addressRepository = addressRepository;
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<AddressDto>> GetBuyerAddressesAsync(Guid userId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var addresses = await _addressRepository.GetBuyerAddressesAsync(buyer.Id);
        return addresses.Select(MapToDto);
    }

    public async Task<AddressDto> CreateAddressAsync(Guid userId, CreateAddressRequest request)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var existing = await _addressRepository.GetBuyerAddressesAsync(buyer.Id);
        bool isFirst = !existing.Any();

        var address = new Address
        {
            Id = Guid.NewGuid(),
            BuyerId = buyer.Id,
            Label = request.Label?.Trim(),
            Line1 = request.Line1.Trim(),
            Line2 = request.Line2?.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            Pincode = request.Pincode.Trim(),
            Phone = request.Phone.Trim(),
            IsDefault = isFirst || request.IsDefault,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _addressRepository.CreateAsync(address);
        return MapToDto(created);
    }

    public async Task<AddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateAddressRequest request)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address == null || address.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Address not found.");
        }

        address.Label = request.Label?.Trim();
        address.Line1 = request.Line1.Trim();
        address.Line2 = request.Line2?.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.Pincode = request.Pincode.Trim();
        address.Phone = request.Phone.Trim();
        address.IsDefault = request.IsDefault;

        await _addressRepository.UpdateAsync(address);
        return MapToDto(address);
    }

    public async Task DeleteAddressAsync(Guid userId, Guid addressId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address == null || address.BuyerId != buyer.Id)
        {
            return;
        }

        await _addressRepository.DeleteAsync(address);
    }

    public async Task SetDefaultAddressAsync(Guid userId, Guid addressId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address == null || address.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Address not found.");
        }

        await _addressRepository.SetDefaultAsync(buyer.Id, addressId);
    }

    private static AddressDto MapToDto(Address a) => new()
    {
        Id = a.Id,
        Label = a.Label,
        Line1 = a.Line1,
        Line2 = a.Line2,
        City = a.City,
        State = a.State,
        Pincode = a.Pincode,
        Phone = a.Phone,
        IsDefault = a.IsDefault
    };
}
