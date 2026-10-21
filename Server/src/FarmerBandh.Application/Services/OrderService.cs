using FarmerBandh.Application.DTOs.CartAndOrders;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly IAddressRepository _addressRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICouponRepository _couponRepository;
    private readonly IPlatformSettingRepository _settingRepository;
    private readonly ICartService _cartService;
    private readonly ITimelineService _timelineService;
    private readonly INotificationService _notificationService;

    public OrderService(
        IOrderRepository orderRepository,
        ICartRepository cartRepository,
        IAddressRepository addressRepository,
        IProductRepository productRepository,
        ICouponRepository couponRepository,
        IPlatformSettingRepository settingRepository,
        ICartService cartService,
        ITimelineService timelineService,
        INotificationService notificationService)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _addressRepository = addressRepository;
        _productRepository = productRepository;
        _couponRepository = couponRepository;
        _settingRepository = settingRepository;
        _cartService = cartService;
        _timelineService = timelineService;
        _notificationService = notificationService;
    }

    public async Task<OrderPlacementResultDto> CreateOrderAsync(Guid userId, CreateOrderRequest request)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var cart = await _cartRepository.GetByBuyerIdAsync(buyer.Id);
        if (cart == null || !cart.Items.Any())
        {
            throw new InvalidOperationException("Cannot checkout with an empty cart.");
        }

        var address = await _addressRepository.GetByIdAsync(request.AddressId);
        if (address == null || address.BuyerId != buyer.Id)
        {
            throw new ArgumentException("Invalid delivery address selected.");
        }

        var settings = await _settingRepository.GetSettingsAsync();

        // Check stock availability
        foreach (var item in cart.Items)
        {
            if (item.Product == null || item.Product.Status != ProductStatus.Active)
            {
                throw new InvalidOperationException($"Product '{item.Product?.Name ?? "Item"}' is no longer available.");
            }
            if ((item.Farmer != null && item.Farmer.Verified != 2) || (item.Product.Farmer != null && item.Product.Farmer.Verified != 2))
            {
                throw new InvalidOperationException($"The seller for product '{item.Product.Name}' is awaiting admin verification and cannot be ordered yet.");
            }
            if (item.QuantityQuintal > item.Product.AvailableQuantityQuintal)
            {
                throw new InvalidOperationException($"Insufficient stock for '{item.Product.Name}'. Requested: {item.QuantityQuintal} Quintals, Available: {item.Product.AvailableQuantityQuintal} Quintals.");
            }
        }

        // Coupon calculation across entire cart
        string? couponCode = !string.IsNullOrWhiteSpace(request.CouponCode) ? request.CouponCode : cart.CouponCode;
        Coupon? coupon = null;
        decimal overallCouponDiscount = 0m;
        bool isFreeShipping = false;

        decimal cartSubtotal = cart.Items.Sum(i => i.LineTotal);

        if (!string.IsNullOrWhiteSpace(couponCode))
        {
            coupon = await _couponRepository.GetByCodeAsync(couponCode);
            if (coupon != null && coupon.IsActive && cartSubtotal >= coupon.MinOrderValue)
            {
                if (coupon.Type == CouponType.Percent)
                {
                    overallCouponDiscount = Math.Round(cartSubtotal * (coupon.Value / 100m), 2);
                    if (coupon.MaxDiscount.HasValue && overallCouponDiscount > coupon.MaxDiscount.Value)
                    {
                        overallCouponDiscount = coupon.MaxDiscount.Value;
                    }
                }
                else if (coupon.Type == CouponType.Flat)
                {
                    overallCouponDiscount = Math.Min(coupon.Value, cartSubtotal);
                }
                else if (coupon.Type == CouponType.FreeShipping)
                {
                    isFreeShipping = true;
                }
            }
        }

        // Group cart items by seller (Product.FarmerId)
        var sellerGroups = cart.Items.GroupBy(i => i.Product != null && i.Product.FarmerId != Guid.Empty ? i.Product.FarmerId : i.FarmerId).ToList();
        var createdOrders = new List<Order>();

        PaymentMethod paymentMethod = Enum.IsDefined(typeof(PaymentMethod), request.PaymentMethod)
            ? (PaymentMethod)request.PaymentMethod
            : PaymentMethod.COD;

        PaymentStatus initialPaymentStatus = paymentMethod switch
        {
            PaymentMethod.COD => PaymentStatus.Pending,
            PaymentMethod.Razorpay when request.PaidAmount.HasValue && request.PaidAmount.Value < cartSubtotal && request.PaidAmount.Value > 0 => PaymentStatus.PartiallyPaid,
            PaymentMethod.Razorpay when request.PaidAmount.HasValue && request.PaidAmount.Value <= 0 => PaymentStatus.Pending,
            _ => PaymentStatus.Paid
        };

        decimal grandTotal = 0m;

        for (int idx = 0; idx < sellerGroups.Count; idx++)
        {
            var group = sellerGroups[idx];
            if (group.Key == Guid.Empty)
            {
                throw new InvalidOperationException("SellerId cannot be empty when placing an order.");
            }
            decimal groupSubtotal = group.Sum(i => i.LineTotal);

            decimal groupDiscount = 0m;
            if (cartSubtotal > 0 && overallCouponDiscount > 0)
            {
                if (idx == sellerGroups.Count - 1)
                {
                    groupDiscount = overallCouponDiscount - createdOrders.Sum(o => o.DiscountAmount);
                }
                else
                {
                    groupDiscount = Math.Round(overallCouponDiscount * (groupSubtotal / cartSubtotal), 2);
                }
            }

            decimal deliveryFee = isFreeShipping ? 0m : settings.DefaultDeliveryFee;
            decimal platformFee = settings.PlatformFee;
            decimal taxable = Math.Max(0, groupSubtotal - groupDiscount);
            decimal taxAmount = Math.Round(taxable * (settings.TaxPercent / 100m), 2);
            decimal orderTotal = taxable + deliveryFee + platformFee + taxAmount;

            string randomSuffix = Guid.NewGuid().ToString("N")[..6].ToUpper();
            string orderNumber = $"FB-{DateTime.UtcNow:yyyyMMdd}-{randomSuffix}";

            var order = new Order
            {
                Id = Guid.NewGuid(),
                OrderNumber = orderNumber,
                BuyerId = buyer.Id,
                SellerId = group.Key,
                AddressId = address.Id,
                DeliveryLine1 = address.Line1,
                DeliveryLine2 = address.Line2,
                DeliveryCity = address.City,
                DeliveryState = address.State,
                DeliveryPincode = address.Pincode,
                DeliveryPhone = address.Phone,
                DeliverySlotDate = request.DeliverySlotDate,
                DeliverySlotWindow = string.IsNullOrWhiteSpace(request.DeliverySlotWindow) ? "Morning (8 AM - 12 PM)" : request.DeliverySlotWindow,
                Subtotal = groupSubtotal,
                DeliveryFee = deliveryFee,
                PlatformFee = platformFee,
                TaxAmount = taxAmount,
                DiscountAmount = groupDiscount,
                TotalAmount = orderTotal,
                CouponCode = coupon?.Code,
                Status = OrderStatus.Pending,
                PaymentMethod = paymentMethod,
                PaymentStatus = initialPaymentStatus,
                PlacedAt = DateTime.UtcNow
            };

            foreach (var item in group)
            {
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    ProductNameSnapshot = item.Product?.Name ?? string.Empty,
                    FarmerNameSnapshot = item.Farmer?.FarmName ?? string.Empty,
                    GradeSnapshot = 1,
                    QuantityQuintal = item.QuantityQuintal,
                    UnitPricePerQuintal = item.UnitPricePerQuintal,
                    LineDiscount = item.LineDiscount,
                    LineTotal = item.LineTotal
                };
                order.Items.Add(orderItem);

                // Decrement stock
                if (item.Product != null)
                {
                    item.Product.AvailableQuantityQuintal -= item.QuantityQuintal;
                    if (item.Product.AvailableQuantityQuintal <= 0)
                    {
                        item.Product.AvailableQuantityQuintal = 0;
                        item.Product.Status = ProductStatus.OutOfStock;
                    }
                    await _productRepository.UpdateAsync(item.Product);
                }
            }

            await _orderRepository.CreateOrderAsync(order);
            await _timelineService.LogStatusChangeAsync(order.Id, OrderStatus.Pending, userId, UserRole.Buyer, "Order Placed by Buyer");

            // Notify seller after order is created
            var sellerFarmer = await _productRepository.GetFarmerByIdAsync(order.SellerId);
            if (sellerFarmer != null)
            {
                var buyerName = buyer.User?.FullName ?? "A customer";
                var firstItemName = order.Items.FirstOrDefault()?.ProductNameSnapshot ?? "Produce";
                await _notificationService.CreateAsync(
                    sellerFarmer.UserId,
                    NotificationType.ORDER_PLACED,
                    "New order received",
                    $"{buyerName} placed order #{order.OrderNumber} ({firstItemName}, Total: ₹{order.TotalAmount:N2}).",
                    $"/seller/orders/{order.Id}",
                    "Order",
                    order.Id
                );
            }

            createdOrders.Add(order);
            grandTotal += orderTotal;
        }

        if (coupon != null && !string.IsNullOrWhiteSpace(coupon.Code))
        {
            await _couponRepository.IncrementUsedCountAsync(coupon.Code);
        }

        await _cartRepository.ClearCartAsync(cart.Id);

        var summaries = createdOrders.Select(o => MapToSummary(o)).ToList();

        return new OrderPlacementResultDto
        {
            GrandTotal = grandTotal,
            Orders = summaries
        };
    }

    public async Task<PagedResultDto<OrderSummaryDto>> GetBuyerOrdersAsync(Guid userId, string? status, string? search, int page, int pageSize)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            return new PagedResultDto<OrderSummaryDto> { Items = [], Total = 0, Page = page, PageSize = pageSize };
        }

        var (items, total) = await _orderRepository.GetBuyerOrdersAsync(buyer.Id, status, search, page, pageSize);
        var dtos = items.Select(MapToSummary).ToList();

        return new PagedResultDto<OrderSummaryDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailDto> GetBuyerOrderByIdAsync(Guid userId, Guid orderId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        return MapToDetail(order);
    }

    public async Task CancelBuyerOrderAsync(Guid userId, Guid orderId, string? reason)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
        {
            throw new InvalidOperationException("Order cannot be cancelled at its current status.");
        }

        order.Status = OrderStatus.Cancelled;
        order.CancelledAt = DateTime.UtcNow;
        order.CancellationReason = reason ?? "Cancelled by buyer";

        // Restock items
        foreach (var item in order.Items)
        {
            if (item.Product != null)
            {
                item.Product.AvailableQuantityQuintal += item.QuantityQuintal;
                if (item.Product.Status == ProductStatus.OutOfStock && item.Product.AvailableQuantityQuintal > 0)
                {
                    item.Product.Status = ProductStatus.Active;
                }
                await _productRepository.UpdateAsync(item.Product);
            }
        }

        await _orderRepository.UpdateOrderAsync(order);
        await _timelineService.LogStatusChangeAsync(order.Id, OrderStatus.Cancelled, userId, UserRole.Buyer, order.CancellationReason);

        // Notify seller after buyer cancellation
        var sellerFarmer = await _productRepository.GetFarmerByIdAsync(order.SellerId);
        if (sellerFarmer != null)
        {
            var buyerName = buyer.User?.FullName ?? "Buyer";
            await _notificationService.CreateAsync(
                sellerFarmer.UserId,
                NotificationType.ORDER_CANCELLED,
                "Order cancelled",
                $"{buyerName} cancelled order #{order.OrderNumber}. Reason: {order.CancellationReason}",
                $"/seller/orders/{order.Id}",
                "Order",
                order.Id
            );
        }
    }

    public async Task DeleteBuyerOrderAsync(Guid userId, Guid orderId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        await _orderRepository.DeleteOrderAsync(order);
    }

    public async Task<OrderPlacementResultDto> ReorderAsync(Guid userId, Guid orderId)

    {
        var orderDetail = await GetBuyerOrderByIdAsync(userId, orderId);
        foreach (var item in orderDetail.Items)
        {
            await _cartService.AddItemAsync(userId, new AddCartItemRequest
            {
                ProductId = item.ProductId,
                QuantityQuintal = item.QuantityQuintal
            });
        }

        var cart = await _cartService.GetCartAsync(userId);
        return new OrderPlacementResultDto
        {
            GrandTotal = cart.TotalAmount,
            Orders = []
        };
    }

    public async Task<PagedResultDto<OrderSummaryDto>> GetSellerOrdersAsync(Guid userId, string? status, string? search, int page, int pageSize)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new UnauthorizedAccessException("Only farmers can access seller orders.");
        }

        var (items, total) = await _orderRepository.GetSellerOrdersAsync(farmer.Id, status, search, page, pageSize);
        var dtos = items.Select(MapToSummary).ToList();

        return new PagedResultDto<OrderSummaryDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailDto> GetSellerOrderByIdAsync(Guid userId, Guid orderId)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        return MapToDetail(order);
    }

    public async Task<OrderDetailDto> UpdateSellerOrderStatusAsync(Guid userId, Guid orderId, UpdateOrderStatusRequest request)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        if (Enum.IsDefined(typeof(OrderStatus), request.Status))
        {
            var newStatus = (OrderStatus)request.Status;
            order.Status = newStatus;
            switch (newStatus)
            {
                case OrderStatus.Confirmed:
                    order.ConfirmedAt ??= DateTime.UtcNow;
                    break;
                case OrderStatus.Packed:
                    order.PackedAt ??= DateTime.UtcNow;
                    break;
                case OrderStatus.InTransit:
                    order.ShippedAt ??= DateTime.UtcNow;
                    break;
                case OrderStatus.Delivered:
                    order.DeliveredAt ??= DateTime.UtcNow;
                    if (order.PaymentMethod == PaymentMethod.COD)
                    {
                        order.PaymentStatus = PaymentStatus.Paid;
                    }
                    break;
                case OrderStatus.Cancelled:
                    order.CancelledAt ??= DateTime.UtcNow;
                    // Restock items on cancellation
                    foreach (var item in order.Items)
                    {
                        if (item.Product != null)
                        {
                            item.Product.AvailableQuantityQuintal += item.QuantityQuintal;
                            if (item.Product.Status == ProductStatus.OutOfStock)
                            {
                                item.Product.Status = ProductStatus.Active;
                            }
                            await _productRepository.UpdateAsync(item.Product);
                        }
                    }
                    break;
            }
            await _orderRepository.UpdateOrderAsync(order);
            await _timelineService.LogStatusChangeAsync(order.Id, newStatus, userId, UserRole.Farmer, $"Order Status updated to {newStatus}");

            // Notify buyer of status update
            var buyerUserId = order.Buyer?.UserId ?? (await _orderRepository.GetByIdAsync(order.Id))?.Buyer?.UserId;
            if (buyerUserId.HasValue && buyerUserId.Value != Guid.Empty)
            {
                var (title, body, notifType) = newStatus switch
                {
                    OrderStatus.Confirmed => ("Order Confirmed", $"Your order #{order.OrderNumber} has been confirmed by the farmer.", NotificationType.ORDER_CONFIRMED),
                    OrderStatus.Packed => ("Order Packed", $"Your order #{order.OrderNumber} is packed and ready to ship.", NotificationType.ORDER_PACKED),
                    OrderStatus.InTransit => ("Order Shipped", $"Your order #{order.OrderNumber} is out for delivery / ready for pickup.", NotificationType.ORDER_SHIPPED),
                    OrderStatus.Delivered => ("Order Delivered", $"Your order #{order.OrderNumber} has been delivered. Leave a review?", NotificationType.ORDER_DELIVERED),
                    OrderStatus.Cancelled => ("Order Cancelled", $"Your order #{order.OrderNumber} was cancelled by the seller.", NotificationType.ORDER_CANCELLED),
                    _ => (string.Empty, string.Empty, (NotificationType)0)
                };

                if (!string.IsNullOrEmpty(title))
                {
                    await _notificationService.CreateAsync(
                        buyerUserId.Value,
                        notifType,
                        title,
                        body,
                        $"/orders/{order.Id}",
                        "Order",
                        order.Id
                    );
                }
            }
        }

        return MapToDetail(order);
    }

    public async Task<OrderDetailDto> RejectSellerOrderAsync(Guid userId, Guid orderId, RejectOrderRequest request)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        order.Status = OrderStatus.Cancelled;
        order.CancelledAt = DateTime.UtcNow;
        order.CancellationReason = string.IsNullOrWhiteSpace(request.Reason) ? "Rejected by seller" : request.Reason;

        // Restock
        foreach (var item in order.Items)
        {
            if (item.Product != null)
            {
                item.Product.AvailableQuantityQuintal += item.QuantityQuintal;
                if (item.Product.Status == ProductStatus.OutOfStock)
                {
                    item.Product.Status = ProductStatus.Active;
                }
                await _productRepository.UpdateAsync(item.Product);
            }
        }

        await _orderRepository.UpdateOrderAsync(order);
        await _timelineService.LogStatusChangeAsync(order.Id, OrderStatus.Cancelled, userId, UserRole.Farmer, order.CancellationReason);

        var buyerUserId = order.Buyer?.UserId ?? (await _orderRepository.GetByIdAsync(order.Id))?.Buyer?.UserId;
        if (buyerUserId.HasValue && buyerUserId.Value != Guid.Empty)
        {
            await _notificationService.CreateAsync(
                buyerUserId.Value,
                NotificationType.ORDER_CANCELLED,
                "Order Rejected",
                $"Your order #{order.OrderNumber} was rejected by the seller. Reason: {order.CancellationReason}",
                $"/orders/{order.Id}",
                "Order",
                order.Id
            );
        }
        return MapToDetail(order);
    }

    public async Task<OrderDetailDto> RecordOrderPaymentAsync(Guid userId, Guid orderId, RecordPaymentRequest request)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        var isBuyer = order.Buyer?.UserId == userId;
        var isSeller = order.Seller?.UserId == userId;
        if (!isBuyer && !isSeller)
        {
            var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
            if (buyer != null && order.BuyerId == buyer.Id) isBuyer = true;
            var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
            if (farmer != null && order.SellerId == farmer.Id) isSeller = true;
        }

        if (!isBuyer && !isSeller)
        {
            throw new UnauthorizedAccessException("Not authorized to record payment for this order.");
        }

        if (request.PaymentMethod.HasValue && Enum.IsDefined(typeof(PaymentMethod), request.PaymentMethod.Value))
        {
            order.PaymentMethod = (PaymentMethod)request.PaymentMethod.Value;
        }
        else
        {
            order.PaymentMethod = PaymentMethod.Razorpay;
        }

        var paidAmount = request.Amount;
        if (paidAmount >= order.TotalAmount)
        {
            order.PaymentStatus = PaymentStatus.Paid;
        }
        else if (paidAmount > 0)
        {
            order.PaymentStatus = PaymentStatus.PartiallyPaid;
        }

        await _orderRepository.UpdateOrderAsync(order);

        var paymentRef = !string.IsNullOrWhiteSpace(request.PaymentId) ? request.PaymentId : request.PaymentLinkId ?? "plink_Tqe4bgUXaopgZ0";
        var role = isBuyer ? UserRole.Buyer : UserRole.Farmer;
        await _timelineService.LogStatusChangeAsync(
            order.Id,
            order.Status,
            userId,
            role,
            $"Payment of ₹{paidAmount:N2} processed via Razorpay ({paymentRef}). Status: {order.PaymentStatus}."
        );

        if (isBuyer)
        {
            var sellerFarmer = await _productRepository.GetFarmerByIdAsync(order.SellerId);
            if (sellerFarmer != null)
            {
                await _notificationService.CreateAsync(
                    sellerFarmer.UserId,
                    NotificationType.ORDER_PLACED,
                    "Payment Received",
                    $"Payment of ₹{paidAmount:N2} received via Razorpay for order #{order.OrderNumber}.",
                    $"/seller/orders/{order.Id}",
                    "Order",
                    order.Id
                );
            }
        }

        return MapToDetail(order);
    }

    public async Task<OrderDetailDto> UpdateSellerOrderPaymentStatusAsync(Guid userId, Guid orderId, UpdatePaymentStatusRequest request)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        if (Enum.IsDefined(typeof(PaymentStatus), request.PaymentStatus))
        {
            order.PaymentStatus = (PaymentStatus)request.PaymentStatus;
        }

        await _orderRepository.UpdateOrderAsync(order);

        await _timelineService.LogStatusChangeAsync(
            order.Id,
            order.Status,
            userId,
            UserRole.Farmer,
            $"Farmer updated payment status to {order.PaymentStatus}. {request.Notes}"
        );

        return MapToDetail(order);
    }

    public async Task<PublicSettingsDto> GetPublicSettingsAsync()
    {
        var s = await _settingRepository.GetSettingsAsync();
        return new PublicSettingsDto
        {
            CommissionPercent = s.CommissionPercent,
            DefaultDeliveryFee = s.DefaultDeliveryFee,
            PlatformFee = s.PlatformFee,
            TaxPercent = s.TaxPercent,
            CODEnabled = s.CODEnabled
        };
    }

    private static OrderSummaryDto MapToSummary(Order o)
    {
        return new OrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            SellerId = o.SellerId,
            SellerName = o.Seller?.FarmName ?? "Farmer",
            BuyerName = o.Buyer?.User?.FullName ?? "Buyer",
            ItemsCount = o.Items.Count,
            TotalAmount = o.TotalAmount,
            Status = o.Status.ToString(),
            PaymentMethod = o.PaymentMethod.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            PlacedAt = o.PlacedAt
        };
    }

    private static OrderDetailDto MapToDetail(Order o)
    {
        return new OrderDetailDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            BuyerId = o.BuyerId,
            BuyerName = o.Buyer?.User?.FullName ?? "Buyer",
            SellerId = o.SellerId,
            SellerName = o.Seller?.FarmName ?? "Farmer",
            SellerLocation = $"{o.Seller?.District}, {o.Seller?.State}",
            DeliveryAddress = new AddressDto
            {
                Id = o.AddressId,
                Label = o.Address?.Label ?? "Delivery Address",
                Line1 = o.Address?.Line1 ?? o.DeliveryLine1,
                Line2 = o.Address?.Line2 ?? o.DeliveryLine2,
                City = o.Address?.City ?? o.DeliveryCity,
                State = o.Address?.State ?? o.DeliveryState,
                Pincode = o.Address?.Pincode ?? o.DeliveryPincode,
                Phone = o.Address?.Phone ?? o.DeliveryPhone,
                IsDefault = o.Address?.IsDefault ?? false
            },
            DeliverySlotDate = o.DeliverySlotDate,
            DeliverySlotWindow = o.DeliverySlotWindow,
            Subtotal = o.Subtotal,
            DeliveryFee = o.DeliveryFee,
            PlatformFee = o.PlatformFee,
            TaxAmount = o.TaxAmount,
            DiscountAmount = o.DiscountAmount,
            TotalAmount = o.TotalAmount,
            CouponCode = o.CouponCode,
            Status = o.Status.ToString(),
            PaymentMethod = o.PaymentMethod.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            PlacedAt = o.PlacedAt,
            ConfirmedAt = o.ConfirmedAt,
            PackedAt = o.PackedAt,
            ShippedAt = o.ShippedAt,
            DeliveredAt = o.DeliveredAt,
            CancelledAt = o.CancelledAt,
            CancellationReason = o.CancellationReason,
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = !string.IsNullOrEmpty(i.ProductNameSnapshot) ? i.ProductNameSnapshot : (i.Product?.Name ?? "Product"),
                FarmerName = !string.IsNullOrEmpty(i.FarmerNameSnapshot) ? i.FarmerNameSnapshot : (i.Product?.Farmer?.FarmName ?? "Farmer"),
                Grade = i.Product?.Grade.ToString() ?? "A",
                QuantityQuintal = i.QuantityQuintal,
                UnitPricePerQuintal = i.UnitPricePerQuintal,
                LineDiscount = i.LineDiscount,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}
