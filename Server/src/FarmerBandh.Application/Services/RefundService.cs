using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Refunds;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class RefundService : IRefundService
{
    private readonly IRefundRepository _refundRepository;
    private readonly IReturnRepository _returnRepository;
    private readonly IProductRepository _productRepository;
    private readonly ITimelineService _timelineService;

    public RefundService(
        IRefundRepository refundRepository,
        IReturnRepository returnRepository,
        IProductRepository productRepository,
        ITimelineService timelineService)
    {
        _refundRepository = refundRepository;
        _returnRepository = returnRepository;
        _productRepository = productRepository;
        _timelineService = timelineService;
    }

    public async Task<RefundDto> ProcessRefundAsync(Guid userId, Guid refundId)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found.");
        }

        var refund = await _refundRepository.GetByIdAsync(refundId);
        if (refund == null || refund.SellerId != farmer.Id)
        {
            throw new KeyNotFoundException("Refund record not found.");
        }

        if (refund.Status == RefundStatus.Processed)
        {
            return MapToDto(refund);
        }

        refund.Status = RefundStatus.Processed;
        refund.ProcessedAt = DateTime.UtcNow;
        refund.Reference = $"REF-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        await _refundRepository.UpdateAsync(refund);

        var returnReq = await _returnRepository.GetByIdAsync(refund.ReturnRequestId);
        if (returnReq != null)
        {
            returnReq.Status = ReturnStatus.Refunded;
            returnReq.RefundedAt = DateTime.UtcNow;
            await _returnRepository.UpdateAsync(returnReq);

            await _timelineService.LogStatusChangeAsync(refund.OrderId, returnReq.Order?.Status ?? OrderStatus.Delivered, userId, UserRole.Farmer, $"Mock Refund Processed: ₹{refund.Amount} (Ref: {refund.Reference})");
        }

        return MapToDto(refund);
    }

    public async Task<PagedResultDto<RefundDto>> GetUserRefundsAsync(Guid userId, string? status, int page, int pageSize)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        bool isSeller = farmer != null;

        var (items, total) = await _refundRepository.GetUserRefundsAsync(userId, isSeller, status, page, pageSize);
        var dtos = items.Select(MapToDto).ToList();

        return new PagedResultDto<RefundDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    private static RefundDto MapToDto(Refund rf)
    {
        return new RefundDto
        {
            Id = rf.Id,
            ReturnRequestId = rf.ReturnRequestId,
            OrderId = rf.OrderId,
            OrderNumber = rf.Order?.OrderNumber ?? string.Empty,
            BuyerId = rf.BuyerId,
            BuyerName = rf.Buyer?.User?.FullName ?? "Buyer",
            SellerId = rf.SellerId,
            SellerName = rf.Seller?.FarmName ?? "Farmer",
            Amount = rf.Amount,
            Method = rf.Method.ToString(),
            Status = rf.Status.ToString(),
            ProcessedAt = rf.ProcessedAt,
            Reference = rf.Reference,
            CreatedAt = rf.CreatedAt
        };
    }
}
