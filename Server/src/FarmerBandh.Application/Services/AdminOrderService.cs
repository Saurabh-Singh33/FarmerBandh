using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminOrderService : IAdminOrderService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminOrderService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminOrderListItemDto> Items, int TotalCount)> GetOrdersAsync(AdminOrderQuery query)
    {
        return await _adminRepository.GetOrdersAsync(query);
    }

    public async Task<AdminOrderDetailDto?> GetOrderDetailAsync(Guid id)
    {
        return await _adminRepository.GetOrderDetailAsync(id);
    }

    public async Task<bool> RefundOrderAsync(Guid id, AdminOrderRefundRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var order = await _adminRepository.GetOrderByIdAsync(id);
        if (order == null) return false;

        if (request.Amount <= 0 || request.Amount > order.TotalAmount)
        {
            throw new ArgumentException("Refund amount must be greater than zero and not exceed order total.");
        }

        var refund = new Refund
        {
            Id = Guid.NewGuid(),
            OrderId = id,
            BuyerId = order.BuyerId,
            SellerId = order.SellerId,
            Amount = request.Amount,
            Status = RefundStatus.Processed,
            ProcessedAt = DateTime.UtcNow,
            Reference = "REF-ADM-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + Guid.NewGuid().ToString("N")[..6].ToUpper() + " (" + request.Reason + ")",
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.AddRefundAsync(refund);
        order.PaymentStatus = PaymentStatus.Refunded;
        await _adminRepository.UpdateOrderAsync(order);

        await _adminRepository.AddOrderStatusHistoryAsync(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = id,
            Status = order.Status,
            Note = $"Admin issued refund of ₹{request.Amount:N2}. Reason: {request.Reason}",
            CreatedAt = DateTime.UtcNow
        });

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "ORDER_REFUNDED",
            targetType: "Order",
            targetId: order.Id,
            summary: $"Processed refund of ₹{request.Amount:N2} for order {order.OrderNumber}. Reason: {request.Reason}",
            metadata: $"{{\"orderNumber\":\"{order.OrderNumber}\",\"amount\":{request.Amount},\"reference\":\"{refund.Reference}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> ForceCompleteOrderAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var order = await _adminRepository.GetOrderByIdAsync(id);
        if (order == null) return false;

        var previousStatus = order.Status.ToString();
        order.Status = OrderStatus.Delivered;
        order.DeliveredAt = DateTime.UtcNow;
        await _adminRepository.UpdateOrderAsync(order);

        await _adminRepository.AddOrderStatusHistoryAsync(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = id,
            Status = OrderStatus.Delivered,
            Note = "Order marked as Delivered by Admin (force-complete).",
            CreatedAt = DateTime.UtcNow
        });

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "ORDER_FORCE_COMPLETED",
            targetType: "Order",
            targetId: order.Id,
            summary: $"Admin force-completed order {order.OrderNumber} (previous status: {previousStatus})",
            metadata: $"{{\"orderNumber\":\"{order.OrderNumber}\",\"previousStatus\":\"{previousStatus}\",\"newStatus\":\"Delivered\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> CancelOrderAsync(Guid id, AdminOrderCancelRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var order = await _adminRepository.GetOrderByIdAsync(id);
        if (order == null) return false;

        var previousStatus = order.Status.ToString();
        order.Status = OrderStatus.Cancelled;
        order.CancelledAt = DateTime.UtcNow;
        order.CancellationReason = request.Reason;
        await _adminRepository.UpdateOrderAsync(order);

        // Restock products
        foreach (var item in order.Items)
        {
            var product = await _adminRepository.GetProductByIdAsync(item.ProductId);
            if (product != null)
            {
                product.AvailableQuantityQuintal += item.QuantityQuintal;
                if (product.Status == ProductStatus.OutOfStock)
                {
                    product.Status = ProductStatus.Active;
                }
                await _adminRepository.UpdateProductAsync(product);
            }
        }

        await _adminRepository.AddOrderStatusHistoryAsync(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = id,
            Status = OrderStatus.Cancelled,
            Note = $"Order cancelled by Admin. Reason: {request.Reason}",
            CreatedAt = DateTime.UtcNow
        });

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "ORDER_CANCELLED",
            targetType: "Order",
            targetId: order.Id,
            summary: $"Admin cancelled order {order.OrderNumber} and restocked products. Reason: {request.Reason}",
            metadata: $"{{\"orderNumber\":\"{order.OrderNumber}\",\"previousStatus\":\"{previousStatus}\",\"reason\":\"{request.Reason.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> OverrideStatusAsync(Guid id, AdminOrderStatusOverrideRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var order = await _adminRepository.GetOrderByIdAsync(id);
        if (order == null) return false;

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
        {
            throw new ArgumentException($"Invalid order status: {request.Status}");
        }

        var previousStatus = order.Status.ToString();
        order.Status = newStatus;
        if (newStatus == OrderStatus.Delivered && !order.DeliveredAt.HasValue) order.DeliveredAt = DateTime.UtcNow;
        if (newStatus == OrderStatus.Confirmed && !order.ConfirmedAt.HasValue) order.ConfirmedAt = DateTime.UtcNow;
        if (newStatus == OrderStatus.InTransit && !order.ShippedAt.HasValue) order.ShippedAt = DateTime.UtcNow;
        if (newStatus == OrderStatus.Cancelled && !order.CancelledAt.HasValue) order.CancelledAt = DateTime.UtcNow;

        await _adminRepository.UpdateOrderAsync(order);

        await _adminRepository.AddOrderStatusHistoryAsync(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = id,
            Status = newStatus,
            Note = $"Status override by Admin to {newStatus}. Note: {request.Note ?? "None"}",
            CreatedAt = DateTime.UtcNow
        });

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "ORDER_STATUS_OVERRIDDEN",
            targetType: "Order",
            targetId: order.Id,
            summary: $"Admin overrode status for order {order.OrderNumber} from {previousStatus} to {newStatus}",
            metadata: $"{{\"orderNumber\":\"{order.OrderNumber}\",\"previousStatus\":\"{previousStatus}\",\"newStatus\":\"{newStatus}\",\"note\":\"{request.Note?.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
