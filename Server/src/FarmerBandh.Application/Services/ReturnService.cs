using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Refunds;
using FarmerBandh.Application.DTOs.Returns;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class ReturnService : IReturnService
{
    private readonly IReturnRepository _returnRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly ITimelineService _timelineService;
    private readonly IRefundRepository _refundRepository;
    private readonly INotificationService _notificationService;

    public ReturnService(
        IReturnRepository returnRepository,
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        ITimelineService timelineService,
        IRefundRepository refundRepository,
        INotificationService notificationService)
    {
        _returnRepository = returnRepository;
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _timelineService = timelineService;
        _refundRepository = refundRepository;
        _notificationService = notificationService;
    }

    public async Task<ReturnDetailDto> CreateReturnAsync(Guid userId, Guid orderId, CreateReturnRequest request)
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

        if (order.Status != OrderStatus.Delivered)
        {
            throw new InvalidOperationException("Returns can only be requested for Delivered orders.");
        }

        if (await _returnRepository.HasOpenReturnAsync(orderId))
        {
            throw new InvalidOperationException("An active return request already exists for this order.");
        }

        var categoryInt = request.ReasonCategory;
        if (categoryInt == 0 && !string.IsNullOrWhiteSpace(request.Category))
        {
            categoryInt = request.Category.Trim().ToLower() switch
            {
                "damaged" or "qualityissue" or "packagingdamaged" => 1,
                "wrongitem" => 2,
                "notfresh" or "expiredproduct" => 3,
                "quantitymismatch" => 4,
                _ => 5
            };
        }

        var category = Enum.IsDefined(typeof(ReturnReasonCategory), categoryInt)
            ? (ReturnReasonCategory)categoryInt
            : ReturnReasonCategory.Other;

        var returnRequest = new ReturnRequest
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            BuyerId = buyer.Id,
            SellerId = order.SellerId,
            Reason = request.Reason,
            ReasonCategory = category,
            Status = ReturnStatus.Requested,
            RequestedAt = DateTime.UtcNow
        };

        foreach (var itemReq in request.Items)
        {
            var orderItem = order.Items.FirstOrDefault(i => i.Id == itemReq.OrderItemId);
            if (orderItem != null)
            {
                if (itemReq.QuantityQuintal <= 0 || itemReq.QuantityQuintal > orderItem.QuantityQuintal)
                {
                    throw new ArgumentException($"Return quantity for '{orderItem.ProductNameSnapshot}' must be between 0.01 and {orderItem.QuantityQuintal} Quintals.");
                }

                returnRequest.Items.Add(new ReturnItem
                {
                    Id = Guid.NewGuid(),
                    ReturnRequestId = returnRequest.Id,
                    OrderItemId = orderItem.Id,
                    QuantityQuintal = itemReq.QuantityQuintal,
                    Reason = itemReq.Reason
                });
            }
        }

        await _returnRepository.CreateAsync(returnRequest);
        await _timelineService.LogStatusChangeAsync(orderId, order.Status, userId, UserRole.Buyer, $"Return Requested ({category}): {request.Reason}");

        // Notify farmer of return request
        var farmer = await _productRepository.GetFarmerByIdAsync(order.SellerId);
        if (farmer != null)
        {
            var buyerName = buyer.User?.FullName ?? "Buyer";
            await _notificationService.CreateAsync(
                farmer.UserId,
                NotificationType.RETURN_REQUESTED,
                "Return requested",
                $"{buyerName} requested a return on order #{order.OrderNumber}. Reason: {request.Reason}",
                $"/seller/returns/{returnRequest.Id}",
                "Return",
                returnRequest.Id
            );
        }

        return MapToDetail(returnRequest);
    }

    public async Task<PagedResultDto<ReturnSummaryDto>> GetBuyerReturnsAsync(Guid userId, string? status, int page, int pageSize)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            return new PagedResultDto<ReturnSummaryDto> { Items = [], Total = 0, Page = page, PageSize = pageSize };
        }

        var (items, total) = await _returnRepository.GetBuyerReturnsAsync(buyer.Id, status, page, pageSize);
        var dtos = items.Select(MapToSummary).ToList();

        return new PagedResultDto<ReturnSummaryDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ReturnDetailDto> GetBuyerReturnByIdAsync(Guid userId, Guid returnId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var ret = await _returnRepository.GetByIdAsync(returnId);
        if (ret == null || ret.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Return request not found.");
        }

        return MapToDetail(ret);
    }

    public async Task CancelReturnAsync(Guid userId, Guid returnId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var ret = await _returnRepository.GetByIdAsync(returnId);
        if (ret == null || ret.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Return request not found.");
        }

        if (ret.Status != ReturnStatus.Requested)
        {
            throw new InvalidOperationException("Only return requests with 'Requested' status can be cancelled.");
        }

        ret.Status = ReturnStatus.Cancelled;
        await _returnRepository.UpdateAsync(ret);

        await _timelineService.LogStatusChangeAsync(ret.OrderId, ret.Order?.Status ?? OrderStatus.Delivered, userId, UserRole.Buyer, "Return Request Cancelled by Buyer");
    }

    public async Task DeleteReturnAsync(Guid userId, Guid returnId, bool deleteOrder = false)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var ret = await _returnRepository.GetByIdAsync(returnId);
        if (ret == null || ret.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Return request not found.");
        }

        if (deleteOrder && ret.OrderId != Guid.Empty)
        {
            var order = await _orderRepository.GetByIdAsync(ret.OrderId);
            if (order != null)
            {
                await _orderRepository.DeleteOrderAsync(order);
                return;
            }
        }

        await _returnRepository.DeleteReturnAsync(ret);
    }


    public async Task<PagedResultDto<ReturnSummaryDto>> GetSellerReturnsAsync(Guid userId, string? status, string? search, int page, int pageSize)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            return new PagedResultDto<ReturnSummaryDto> { Items = [], Total = 0, Page = page, PageSize = pageSize };
        }

        var (items, total) = await _returnRepository.GetSellerReturnsAsync(farmer.Id, status, search, page, pageSize);
        var dtos = items.Select(MapToSummary).ToList();

        return new PagedResultDto<ReturnSummaryDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ReturnDetailDto> GetSellerReturnByIdAsync(Guid userId, Guid returnId)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var ret = await _returnRepository.GetByIdAsync(returnId);
        if (ret == null || ret.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Return request not found.");
        }

        return MapToDetail(ret);
    }

    public async Task<ReturnDetailDto> ApproveSellerReturnAsync(Guid userId, Guid returnId, ApproveReturnRequest request)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var ret = await _returnRepository.GetByIdAsync(returnId);
        if (ret == null || ret.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Return request not found.");
        }

        if (ret.Status != ReturnStatus.Requested)
        {
            throw new InvalidOperationException("Return request is no longer pending.");
        }

        ret.Status = ReturnStatus.Approved;
        ret.SellerResponse = request.SellerResponse ?? "Return Approved by Seller";
        ret.RespondedAt = DateTime.UtcNow;

        // Calculate refund amount
        decimal refundAmount = 0m;
        foreach (var item in ret.Items)
        {
            if (item.OrderItem != null)
            {
                refundAmount += item.QuantityQuintal * item.OrderItem.UnitPricePerQuintal;
            }
        }
        if (refundAmount == 0m && ret.Order != null)
        {
            refundAmount = ret.Order.TotalAmount;
        }

        // Create Pending Refund
        var refund = new Refund
        {
            Id = Guid.NewGuid(),
            ReturnRequestId = ret.Id,
            OrderId = ret.OrderId,
            BuyerId = ret.BuyerId,
            SellerId = ret.SellerId,
            Amount = refundAmount,
            Method = RefundMethod.OriginalPayment,
            Status = RefundStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
        await _refundRepository.CreateAsync(refund);
        ret.Refund = refund;

        await _returnRepository.UpdateAsync(ret);
        await _timelineService.LogStatusChangeAsync(ret.OrderId, ret.Order?.Status ?? OrderStatus.Delivered, userId, UserRole.Farmer, $"Return Approved: {ret.SellerResponse}");

        // Notify buyer of return approval
        var buyerUserId = ret.Buyer?.UserId ?? (await _orderRepository.GetByIdAsync(ret.OrderId))?.Buyer?.UserId;
        if (buyerUserId.HasValue)
        {
            await _notificationService.CreateAsync(
                buyerUserId.Value,
                NotificationType.RETURN_APPROVED,
                "Return Approved",
                $"Your return request on order #{ret.Order?.OrderNumber} was approved. Refund of ₹{refundAmount:N2} is queued.",
                $"/returns/{ret.Id}",
                "Return",
                ret.Id
            );
        }

        return MapToDetail(ret);
    }

    public async Task<ReturnDetailDto> RejectSellerReturnAsync(Guid userId, Guid returnId, RejectReturnRequest request)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var ret = await _returnRepository.GetByIdAsync(returnId);
        if (ret == null || ret.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Return request not found.");
        }

        if (ret.Status != ReturnStatus.Requested)
        {
            throw new InvalidOperationException("Return request is no longer pending.");
        }

        ret.Status = ReturnStatus.Rejected;
        ret.SellerResponse = string.IsNullOrWhiteSpace(request.SellerResponse) ? "Rejected by seller" : request.SellerResponse;
        ret.RespondedAt = DateTime.UtcNow;

        await _returnRepository.UpdateAsync(ret);
        await _timelineService.LogStatusChangeAsync(ret.OrderId, ret.Order?.Status ?? OrderStatus.Delivered, userId, UserRole.Farmer, $"Return Rejected: {ret.SellerResponse}");

        // Notify buyer of return rejection
        var buyerUserId = ret.Buyer?.UserId ?? (await _orderRepository.GetByIdAsync(ret.OrderId))?.Buyer?.UserId;
        if (buyerUserId.HasValue)
        {
            await _notificationService.CreateAsync(
                buyerUserId.Value,
                NotificationType.RETURN_REJECTED,
                "Return Rejected",
                $"Your return request on order #{ret.Order?.OrderNumber} was rejected by the seller. Reason: {ret.SellerResponse}",
                $"/returns/{ret.Id}",
                "Return",
                ret.Id
            );
        }

        return MapToDetail(ret);
    }

    public async Task<ReturnMessageDto> AddMessageAsync(Guid userId, Guid returnId, PostReturnMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
        {
            throw new ArgumentException("Message body cannot be empty.");
        }

        var ret = await _returnRepository.GetByIdAsync(returnId);
        if (ret == null)
        {
            throw new KeyNotFoundException("Return request not found.");
        }

        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);

        UserRole senderRole;
        if (buyer != null && ret.BuyerId == buyer.Id)
        {
            senderRole = UserRole.Buyer;
        }
        else if (farmer != null && ret.SellerId == farmer.Id)
        {
            senderRole = UserRole.Farmer;
        }
        else
        {
            senderRole = UserRole.Admin;
        }

        var message = new ReturnMessage
        {
            Id = Guid.NewGuid(),
            ReturnRequestId = returnId,
            SenderUserId = userId,
            SenderRole = senderRole,
            Body = request.Body.Trim(),
            AttachmentUrl = request.AttachmentUrl,
            CreatedAt = DateTime.UtcNow
        };

        await _returnRepository.AddMessageAsync(message);

        var refreshed = await _returnRepository.GetByIdAsync(returnId);
        var createdMsg = refreshed?.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault(m => m.Id == message.Id) ?? message;

        return new ReturnMessageDto
        {
            Id = createdMsg.Id,
            ReturnRequestId = createdMsg.ReturnRequestId,
            SenderUserId = createdMsg.SenderUserId,
            SenderName = createdMsg.SenderUser?.FullName ?? (createdMsg.SenderRole == UserRole.Buyer ? (refreshed?.Buyer?.User?.FullName ?? "Buyer") : (refreshed?.Seller?.FarmName ?? "Farmer")),
            SenderRole = createdMsg.SenderRole.ToString(),
            Body = createdMsg.Body,
            AttachmentUrl = createdMsg.AttachmentUrl,
            CreatedAt = createdMsg.CreatedAt
        };
    }

    public async Task DeleteMessageAsync(Guid userId, Guid returnId, Guid messageId, bool forEveryone)
    {
        var message = await _returnRepository.GetMessageByIdAsync(messageId);
        if (message == null || message.ReturnRequestId != returnId)
        {
            throw new KeyNotFoundException("Message not found.");
        }

        if (forEveryone)
        {
            if (message.SenderUserId != userId)
            {
                throw new UnauthorizedAccessException("You can only delete your own messages for everyone.");
            }
            message.Body = "[deleted]";
            await _returnRepository.UpdateMessageAsync(message);
        }
    }

    private static ReturnDetailDto MapToDetail(ReturnRequest r)
    {
        var refundCalc = r.Refund?.Amount ?? r.Items.Sum(i => i.QuantityQuintal * (i.OrderItem != null ? i.OrderItem.UnitPricePerQuintal : 0m));
        return new ReturnDetailDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            OrderNumber = r.Order?.OrderNumber ?? string.Empty,
            BuyerId = r.BuyerId,
            BuyerName = r.Buyer?.User?.FullName ?? "Buyer",
            SellerId = r.SellerId,
            SellerName = r.Seller?.FarmName ?? "Farmer",
            Reason = r.Reason,
            ReasonCategory = r.ReasonCategory.ToString(),
            Status = r.Status.ToString(),
            SellerResponse = r.SellerResponse,
            TotalAmount = r.Order?.TotalAmount ?? 0m,
            RefundAmount = refundCalc,
            RequestedAt = r.RequestedAt,
            RespondedAt = r.RespondedAt,
            RefundedAt = r.RefundedAt,
            Items = r.Items.Select(i => new ReturnItemDto
            {
                Id = i.Id,
                OrderItemId = i.OrderItemId,
                ProductName = i.OrderItem?.ProductNameSnapshot ?? "Product",
                Grade = i.OrderItem != null ? (i.OrderItem.GradeSnapshot == 1 ? "Grade A" : i.OrderItem.GradeSnapshot == 2 ? "Grade B" : $"Grade {i.OrderItem.GradeSnapshot}") : "Grade A",
                QuantityQuintal = i.QuantityQuintal,
                UnitPricePerQuintal = i.OrderItem?.UnitPricePerQuintal ?? 0m,
                Reason = i.Reason
            }).ToList(),
            Messages = r.Messages.OrderBy(m => m.CreatedAt).Select(m => new ReturnMessageDto
            {
                Id = m.Id,
                ReturnRequestId = m.ReturnRequestId,
                SenderUserId = m.SenderUserId,
                SenderName = m.SenderUser?.FullName ?? (m.SenderRole == UserRole.Buyer ? (r.Buyer?.User?.FullName ?? "Buyer") : (r.Seller?.FarmName ?? "Farmer")),
                SenderRole = m.SenderRole.ToString(),
                Body = m.Body,
                AttachmentUrl = m.AttachmentUrl,
                CreatedAt = m.CreatedAt
            }).ToList(),
            Refund = r.Refund != null ? new RefundDto
            {
                Id = r.Refund.Id,
                ReturnRequestId = r.Refund.ReturnRequestId,
                OrderId = r.Refund.OrderId,
                OrderNumber = r.Order?.OrderNumber ?? string.Empty,
                BuyerId = r.Refund.BuyerId,
                BuyerName = r.Buyer?.User?.FullName ?? "Buyer",
                SellerId = r.Refund.SellerId,
                SellerName = r.Seller?.FarmName ?? "Farmer",
                Amount = r.Refund.Amount,
                Method = r.Refund.Method.ToString(),
                Status = r.Refund.Status.ToString(),
                ProcessedAt = r.Refund.ProcessedAt,
                Reference = r.Refund.Reference,
                CreatedAt = r.Refund.CreatedAt
            } : null
        };
    }

    private static ReturnSummaryDto MapToSummary(ReturnRequest r)
    {
        return new ReturnSummaryDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            OrderNumber = r.Order?.OrderNumber ?? string.Empty,
            BuyerName = r.Buyer?.User?.FullName ?? "Buyer",
            SellerName = r.Seller?.FarmName ?? "Farmer",
            Reason = r.Reason,
            ReasonCategory = r.ReasonCategory.ToString(),
            Status = r.Status.ToString(),
            SellerResponse = r.SellerResponse,
            TotalAmount = r.Order?.TotalAmount ?? 0m,
            RequestedAt = r.RequestedAt
        };
    }
}
