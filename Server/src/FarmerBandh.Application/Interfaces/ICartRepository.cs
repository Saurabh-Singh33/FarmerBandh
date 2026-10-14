using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByBuyerIdAsync(Guid buyerId);
    Task<Cart> CreateCartAsync(Guid buyerId);
    Task<CartItem?> GetCartItemAsync(Guid cartId, Guid productId);
    Task<CartItem?> GetCartItemByIdAsync(Guid cartItemId);
    Task AddCartItemAsync(CartItem item);
    Task UpdateCartItemAsync(CartItem item);
    Task RemoveCartItemAsync(CartItem item);
    Task UpdateCartAsync(Cart cart);
    Task ClearCartAsync(Guid cartId);
}
