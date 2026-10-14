using FarmerBandh.Application.DTOs.CartAndOrders;

namespace FarmerBandh.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId);
    Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request);
    Task<CartDto> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemRequest request);
    Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId);
    Task<CartDto> ApplyCouponAsync(Guid userId, string code);
    Task<CartDto> RemoveCouponAsync(Guid userId);
    Task ClearCartAsync(Guid userId);
}
