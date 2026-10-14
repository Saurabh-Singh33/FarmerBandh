using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminPayoutService : IAdminPayoutService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminPayoutService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminPayoutListItemDto> Items, int TotalCount)> GetPayoutsAsync(AdminPayoutQuery query)
    {
        return await _adminRepository.GetPayoutsAsync(query);
    }

    public async Task<AdminPayoutDetailDto?> GetPayoutDetailAsync(Guid id)
    {
        return await _adminRepository.GetPayoutDetailAsync(id);
    }

    public async Task<bool> ProcessPayoutAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var payout = await _adminRepository.GetPayoutByIdAsync(id);
        if (payout == null) return false;

        payout.Status = PayoutStatus.Paid;
        payout.ProcessedAt = DateTime.UtcNow;
        payout.PaidAt = DateTime.UtcNow;
        payout.Reference = "TXN-ADM-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + Guid.NewGuid().ToString("N")[..6].ToUpper();
        await _adminRepository.UpdatePayoutAsync(payout);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "PAYOUT_PROCESSED",
            targetType: "Payout",
            targetId: payout.Id,
            summary: $"Processed payout {payout.PayoutNumber} (₹{payout.Amount:N2}). Ref: {payout.Reference}",
            metadata: $"{{\"payoutNumber\":\"{payout.PayoutNumber}\",\"amount\":{payout.Amount},\"reference\":\"{payout.Reference}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> MarkFailedAsync(Guid id, AdminMarkPayoutFailedRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var payout = await _adminRepository.GetPayoutByIdAsync(id);
        if (payout == null) return false;

        payout.Status = PayoutStatus.Failed;
        payout.FailedAt = DateTime.UtcNow;
        payout.FailureReason = request.Reason;
        await _adminRepository.UpdatePayoutAsync(payout);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "PAYOUT_FAILED",
            targetType: "Payout",
            targetId: payout.Id,
            summary: $"Marked payout {payout.PayoutNumber} (₹{payout.Amount:N2}) as Failed. Reason: {request.Reason}",
            metadata: $"{{\"payoutNumber\":\"{payout.PayoutNumber}\",\"reason\":\"{request.Reason.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> RetryPayoutAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var payout = await _adminRepository.GetPayoutByIdAsync(id);
        if (payout == null) return false;

        payout.Status = PayoutStatus.Pending;
        payout.RequestedAt = DateTime.UtcNow;
        payout.FailedAt = null;
        payout.FailureReason = null;
        payout.Reference = null;
        await _adminRepository.UpdatePayoutAsync(payout);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "PAYOUT_RETRIED",
            targetType: "Payout",
            targetId: payout.Id,
            summary: $"Retried payout {payout.PayoutNumber} (₹{payout.Amount:N2}), moved to Pending",
            metadata: $"{{\"payoutNumber\":\"{payout.PayoutNumber}\",\"amount\":{payout.Amount}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<int> BulkProcessPayoutsAsync(AdminBulkProcessPayoutRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var payouts = await _adminRepository.GetPayoutsByIdsAsync(request.Ids);
        var processedCount = 0;

        foreach (var payout in payouts)
        {
            if (payout.Status == PayoutStatus.Pending)
            {
                payout.Status = PayoutStatus.Paid;
                payout.ProcessedAt = DateTime.UtcNow;
                payout.PaidAt = DateTime.UtcNow;
                payout.Reference = "TXN-BULK-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + Guid.NewGuid().ToString("N")[..6].ToUpper();
                await _adminRepository.UpdatePayoutAsync(payout);

                await _activityLogger.LogAsync(
                    action: "PAYOUT_PROCESSED",
                    targetType: "Payout",
                    targetId: payout.Id,
                    summary: $"Bulk processed payout {payout.PayoutNumber} (₹{payout.Amount:N2}). Ref: {payout.Reference}",
                    metadata: $"{{\"payoutNumber\":\"{payout.PayoutNumber}\",\"amount\":{payout.Amount},\"reference\":\"{payout.Reference}\",\"bulk\":true}}",
                    httpContext: httpContext,
                    actorUserId: currentAdminId
                );

                processedCount++;
            }
        }

        if (processedCount > 0)
        {
            await _adminRepository.SaveChangesAsync();
        }

        return processedCount;
    }
}
