using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminRefundService : IAdminRefundService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminRefundService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminRefundListItemDto> Items, int TotalCount)> GetRefundsAsync(AdminRefundQuery query)
    {
        return await _adminRepository.GetRefundsAsync(query);
    }

    public async Task<AdminRefundDetailDto?> GetRefundDetailAsync(Guid id)
    {
        return await _adminRepository.GetRefundDetailAsync(id);
    }

    public async Task<bool> ProcessRefundAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var refund = await _adminRepository.GetRefundByIdAsync(id);
        if (refund == null) return false;

        refund.Status = RefundStatus.Processed;
        refund.ProcessedAt = DateTime.UtcNow;
        refund.Reference = "REF-PROC-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + Guid.NewGuid().ToString("N")[..6].ToUpper();
        await _adminRepository.UpdateRefundAsync(refund);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "REFUND_PROCESSED",
            targetType: "Refund",
            targetId: refund.Id,
            summary: $"Processed refund of ₹{refund.Amount:N2} (Order: {refund.Order?.OrderNumber}). Ref: {refund.Reference}",
            metadata: $"{{\"refundId\":\"{refund.Id}\",\"amount\":{refund.Amount},\"reference\":\"{refund.Reference}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> FailRefundAsync(Guid id, AdminFailRefundRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var refund = await _adminRepository.GetRefundByIdAsync(id);
        if (refund == null) return false;

        refund.Status = RefundStatus.Failed;
        await _adminRepository.UpdateRefundAsync(refund);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "REFUND_FAILED",
            targetType: "Refund",
            targetId: refund.Id,
            summary: $"Marked refund of ₹{refund.Amount:N2} as Failed. Reason: {request.Reason}",
            metadata: $"{{\"refundId\":\"{refund.Id}\",\"reason\":\"{request.Reason.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
