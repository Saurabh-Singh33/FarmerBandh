using FarmerBandh.Application.DTOs.CartAndOrders;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICouponRepository _couponRepository;
    private readonly IPlatformSettingRepository _settingRepository;

    public CartService(
        ICartRepository cartRepository,
        IProductRepository productRepository,
        ICouponRepository couponRepository,
        IPlatformSettingRepository settingRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _couponRepository = couponRepository;
        _settingRepository = settingRepository;
    }

    public async Task<CartDto> GetCartAsync(Guid userId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var cart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        if (cart == null)
        {
            cart = await _cartRepository.CreateCartAsync(buyer.Id);
        }

        return await BuildCartDtoAsync(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product == null || product.Status != ProductStatus.Active)
        {
            throw new KeyNotFoundException("Product is unavailable or out of stock.");
        }

        if (request.QuantityQuintal < product.MinOrderQuantityQuintal)
        {
            throw new ArgumentException($"Minimum order quantity for '{product.Name}' is {product.MinOrderQuantityQuintal} Quintals.");
        }

        if (request.QuantityQuintal > product.AvailableQuantityQuintal)
        {
            throw new ArgumentException($"Only {product.AvailableQuantityQuintal} Quintals available for '{product.Name}'.");
        }

        var cart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        if (cart == null)
        {
            cart = await _cartRepository.CreateCartAsync(buyer.Id);
        }

        var existingItem = await _cartRepository.GetCartItemAsync(cart.Id, product.Id);
        if (existingItem != null)
        {
            decimal newQty = Math.Min(existingItem.QuantityQuintal + request.QuantityQuintal, product.AvailableQuantityQuintal);
            existingItem.QuantityQuintal = newQty;
            existingItem.UnitPricePerQuintal = (request.NegotiatedUnitPrice.HasValue && request.NegotiatedUnitPrice.Value > 0)
                ? request.NegotiatedUnitPrice.Value
                : product.PricePerQuintal;
            existingItem.BulkDiscountPercent = (request.NegotiatedUnitPrice.HasValue && request.NegotiatedUnitPrice.Value > 0)
                ? 0
                : product.BulkDiscountPercent;
            existingItem.BulkDiscountThresholdQuintal = product.BulkDiscountThresholdQuintal;
            RecalculateLineItem(existingItem);
            await _cartRepository.UpdateCartItemAsync(existingItem);
        }
        else
        {
            var unitPrice = (request.NegotiatedUnitPrice.HasValue && request.NegotiatedUnitPrice.Value > 0)
                ? request.NegotiatedUnitPrice.Value
                : product.PricePerQuintal;
            var bulkDiscount = (request.NegotiatedUnitPrice.HasValue && request.NegotiatedUnitPrice.Value > 0)
                ? 0
                : product.BulkDiscountPercent;

            var newItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = product.Id,
                FarmerId = product.FarmerId,
                QuantityQuintal = request.QuantityQuintal,
                UnitPricePerQuintal = unitPrice,
                BulkDiscountPercent = bulkDiscount,
                BulkDiscountThresholdQuintal = product.BulkDiscountThresholdQuintal,
                AddedAt = DateTime.UtcNow
            };
            RecalculateLineItem(newItem);
            await _cartRepository.AddCartItemAsync(newItem);
        }

        var updatedCart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        return await BuildCartDtoAsync(updatedCart!);
    }

    public async Task<CartDto> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemRequest request)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var item = await _cartRepository.GetCartItemByIdAsync(itemId);
        if (item == null)
        {
            throw new KeyNotFoundException("Cart item not found.");
        }

        var product = item.Product;
        if (request.QuantityQuintal < product.MinOrderQuantityQuintal)
        {
            throw new ArgumentException($"Minimum order quantity is {product.MinOrderQuantityQuintal} Quintals.");
        }
        if (request.QuantityQuintal > product.AvailableQuantityQuintal)
        {
            throw new ArgumentException($"Only {product.AvailableQuantityQuintal} Quintals available.");
        }

        item.QuantityQuintal = request.QuantityQuintal;
        item.UnitPricePerQuintal = product.PricePerQuintal;
        item.BulkDiscountPercent = product.BulkDiscountPercent;
        item.BulkDiscountThresholdQuintal = product.BulkDiscountThresholdQuintal;
        RecalculateLineItem(item);

        await _cartRepository.UpdateCartItemAsync(item);

        var updatedCart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        return await BuildCartDtoAsync(updatedCart!);
    }

    public async Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var item = await _cartRepository.GetCartItemByIdAsync(itemId);
        if (item != null)
        {
            await _cartRepository.RemoveCartItemAsync(item);
        }

        var updatedCart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        return await BuildCartDtoAsync(updatedCart!);
    }

    public async Task<CartDto> ApplyCouponAsync(Guid userId, string code)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var coupon = await _couponRepository.GetByCodeAsync(code);
        if (coupon == null || !coupon.IsActive)
        {
            throw new ArgumentException("Invalid or inactive coupon code.");
        }

        if (DateTime.UtcNow < coupon.ValidFrom || DateTime.UtcNow > coupon.ValidTo)
        {
            throw new ArgumentException("Coupon has expired.");
        }

        if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
        {
            throw new ArgumentException("Coupon usage limit exceeded.");
        }

        var cart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        if (cart == null || !cart.Items.Any())
        {
            throw new ArgumentException("Cannot apply coupon to an empty cart.");
        }

        decimal subtotal = cart.Items.Sum(i => i.LineTotal);
        if (subtotal < coupon.MinOrderValue)
        {
            throw new ArgumentException($"Coupon requires a minimum order value of ₹{coupon.MinOrderValue}.");
        }

        cart.CouponCode = coupon.Code;
        await _cartRepository.UpdateCartAsync(cart);

        return await BuildCartDtoAsync(cart);
    }

    public async Task<CartDto> RemoveCouponAsync(Guid userId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var cart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        if (cart != null)
        {
            cart.CouponCode = null;
            await _cartRepository.UpdateCartAsync(cart);
        }

        return await BuildCartDtoAsync(cart!);
    }

    public async Task ClearCartAsync(Guid userId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null) return;

        var cart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        if (cart != null)
        {
            await _cartRepository.ClearCartAsync(cart.Id);
        }
    }

    private static void RecalculateLineItem(CartItem item)
    {
        item.LineSubtotal = item.UnitPricePerQuintal * item.QuantityQuintal;
        if (item.BulkDiscountThresholdQuintal.HasValue && item.QuantityQuintal >= item.BulkDiscountThresholdQuintal.Value)
        {
            item.LineDiscount = Math.Round(item.LineSubtotal * (item.BulkDiscountPercent / 100m), 2);
        }
        else
        {
            item.LineDiscount = 0;
        }
        item.LineTotal = item.LineSubtotal - item.LineDiscount;
    }

    private async Task<CartDto> BuildCartDtoAsync(Cart cart)
    {
        var settings = await _settingRepository.GetSettingsAsync();

        var itemDtos = cart.Items.Select(i => new CartItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? string.Empty,
            ProductSlug = i.Product?.Slug ?? string.Empty,
            CategoryName = i.Product?.Category?.Name ?? string.Empty,
            FarmerId = i.FarmerId,
            FarmerName = i.Farmer?.FarmName ?? string.Empty,
            FarmerLocation = $"{i.Farmer?.District}, {i.Farmer?.State}",
            QuantityQuintal = i.QuantityQuintal,
            UnitPricePerQuintal = i.UnitPricePerQuintal,
            AvailableQuantityQuintal = i.Product?.AvailableQuantityQuintal ?? 0,
            MinOrderQuantityQuintal = i.Product?.MinOrderQuantityQuintal ?? 1,
            BulkDiscountPercent = i.BulkDiscountPercent,
            BulkDiscountThresholdQuintal = i.BulkDiscountThresholdQuintal,
            LineSubtotal = i.LineSubtotal,
            LineDiscount = i.LineDiscount,
            LineTotal = i.LineTotal
        }).ToList();

        decimal subtotal = itemDtos.Sum(i => i.LineTotal);
        decimal bulkDiscountTotal = itemDtos.Sum(i => i.LineDiscount);

        decimal couponDiscount = 0m;
        decimal deliveryFee = itemDtos.Any() ? settings.DefaultDeliveryFee : 0m;

        if (!string.IsNullOrWhiteSpace(cart.CouponCode))
        {
            var coupon = await _couponRepository.GetByCodeAsync(cart.CouponCode);
            if (coupon != null && coupon.IsActive && subtotal >= coupon.MinOrderValue)
            {
                if (coupon.Type == CouponType.Percent)
                {
                    couponDiscount = Math.Round(subtotal * (coupon.Value / 100m), 2);
                    if (coupon.MaxDiscount.HasValue && couponDiscount > coupon.MaxDiscount.Value)
                    {
                        couponDiscount = coupon.MaxDiscount.Value;
                    }
                }
                else if (coupon.Type == CouponType.Flat)
                {
                    couponDiscount = Math.Min(coupon.Value, subtotal);
                }
                else if (coupon.Type == CouponType.FreeShipping)
                {
                    deliveryFee = 0m;
                }
            }
        }

        decimal platformFee = itemDtos.Any() ? settings.PlatformFee : 0m;
        decimal taxableSubtotal = Math.Max(0, subtotal - couponDiscount);
        decimal taxAmount = Math.Round(taxableSubtotal * (settings.TaxPercent / 100m), 2);

        decimal totalAmount = taxableSubtotal + deliveryFee + platformFee + taxAmount;

        return new CartDto
        {
            Id = cart.Id,
            CouponCode = cart.CouponCode,
            Subtotal = subtotal,
            BulkDiscountTotal = bulkDiscountTotal,
            CouponDiscountTotal = couponDiscount,
            DeliveryFee = deliveryFee,
            PlatformFee = platformFee,
            TaxAmount = taxAmount,
            TotalAmount = totalAmount,
            Items = itemDtos
        };
    }
}
