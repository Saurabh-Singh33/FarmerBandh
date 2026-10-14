using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class PayoutService : IPayoutService
{
    private readonly ISellerOperationsRepository _repository;
    private readonly INotificationService _notificationService;

    public PayoutService(ISellerOperationsRepository repository, INotificationService notificationService)
    {
        _repository = repository;
        _notificationService = notificationService;
    }

    public async Task<PagedResultDto<PayoutItemDto>> GetPayoutsAsync(Guid userId, PayoutQueryParams queryParams)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        PayoutStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(queryParams.Status) && Enum.TryParse<PayoutStatus>(queryParams.Status, true, out var parsed))
        {
            statusFilter = parsed;
        }

        var (items, totalCount) = await _repository.GetPayoutsAsync(farmer.Id, statusFilter, queryParams.Page, queryParams.PageSize);

        return new PagedResultDto<PayoutItemDto>
        {
            Items = items.Select(MapToDto),
            Total = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<PayoutSummaryDto> GetPayoutSummaryAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var deliveredOrders = await _repository.GetDeliveredOrdersAsync(farmer.Id);
        decimal totalEarned = deliveredOrders.Sum(o => o.TotalAmount);

        var payouts = await _repository.GetAllPayoutsForFarmerAsync(farmer.Id);
        decimal totalPaidOut = payouts.Where(p => p.Status == PayoutStatus.Paid).Sum(p => p.Amount);
        decimal pendingPayoutAmount = payouts.Where(p => p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Processing).Sum(p => p.Amount);

        // Calculate refunds for this seller
        decimal totalRefunds = await _repository.GetTotalRefundsForFarmerAsync(farmer.Id);

        // availableForPayout = sum of Delivered order amounts − already requested/paid payouts − refund amounts
        decimal availableForPayout = Math.Max(0, totalEarned - totalPaidOut - pendingPayoutAmount - totalRefunds);

        var settings = await _repository.GetSellerSettingsAsync(farmer.Id);
        decimal minPayout = settings?.MinimumPayoutAmount ?? 500m;

        var lastPaid = payouts.Where(p => p.Status == PayoutStatus.Paid).OrderByDescending(p => p.PaidAt).FirstOrDefault();

        return new PayoutSummaryDto
        {
            TotalEarned = totalEarned,
            TotalPaidOut = totalPaidOut,
            PendingPayoutAmount = pendingPayoutAmount,
            AvailableForPayout = availableForPayout,
            MinimumPayoutAmount = minPayout,
            NextScheduledPayoutAt = null,
            LastPayoutAt = lastPaid?.PaidAt,
            LastPayoutAmount = lastPaid?.Amount
        };
    }

    public async Task<PayoutItemDto> RequestPayoutAsync(Guid userId, RequestPayoutDto request)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var bankAccount = await _repository.GetBankAccountAsync(farmer.Id);
        if (bankAccount == null || string.IsNullOrWhiteSpace(bankAccount.AccountNumber))
        {
            throw new InvalidOperationException("Add bank details first.");
        }

        var summary = await GetPayoutSummaryAsync(userId);
        if (request.Amount < summary.MinimumPayoutAmount)
        {
            throw new InvalidOperationException($"Minimum payout request amount is ₹{summary.MinimumPayoutAmount:N0}.");
        }

        if (request.Amount > summary.AvailableForPayout)
        {
            throw new InvalidOperationException($"Requested amount (₹{request.Amount:N0}) exceeds available balance for payout (₹{summary.AvailableForPayout:N0}).");
        }

        var now = DateTime.UtcNow;
        var randomSuffix = Random.Shared.Next(1000, 9999);
        var payoutNumber = $"FB-PO-{now:yyyyMMdd}-{randomSuffix}";

        var payout = new Payout
        {
            Id = Guid.NewGuid(),
            PayoutNumber = payoutNumber,
            FarmerId = farmer.Id,
            Amount = request.Amount,
            Status = PayoutStatus.Pending,
            Method = !string.IsNullOrWhiteSpace(bankAccount.UpiId) ? PayoutMethod.UPI : PayoutMethod.BankTransfer,
            BankAccountNameSnapshot = bankAccount.AccountHolderName,
            BankAccountNumberSnapshot = bankAccount.AccountNumber,
            IfscCodeSnapshot = bankAccount.IfscCode,
            UpiIdSnapshot = bankAccount.UpiId,
            RequestedAt = now,
            Notes = request.Notes?.Trim()
        };

        await _repository.AddPayoutAsync(payout);
        await _repository.SaveChangesAsync();

        // Notify farmer (self-confirmation)
        await _notificationService.CreateAsync(
            userId,
            NotificationType.PAYOUT_REQUESTED,
            "Payout Requested",
            $"Your payout request {payout.PayoutNumber} for ₹{payout.Amount:N2} was submitted and is pending review.",
            "/seller/payouts",
            "Payout",
            payout.Id
        );

        return MapToDto(payout);
    }

    public async Task<PayoutItemDto> MockProcessPayoutAsync(Guid userId, Guid payoutId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var payout = await _repository.GetPayoutByIdAsync(payoutId);
        if (payout == null || payout.FarmerId != farmer.Id)
        {
            throw new KeyNotFoundException("Payout record not found.");
        }

        if (payout.Status != PayoutStatus.Pending && payout.Status != PayoutStatus.Processing)
        {
            throw new InvalidOperationException($"Payout cannot be processed from status {payout.Status}.");
        }

        var now = DateTime.UtcNow;
        payout.Status = PayoutStatus.Paid;
        payout.ProcessedAt = now;
        payout.PaidAt = now;
        payout.Reference = $"TXN-MOCK-{now:yyyyMM}-{Random.Shared.Next(1000, 9999)}";

        await _repository.UpdatePayoutAsync(payout);
        await _repository.SaveChangesAsync();

        return MapToDto(payout);
    }

    private static PayoutItemDto MapToDto(Payout p)
    {
        var maskedAccount = MaskAccountNumber(p.BankAccountNumberSnapshot);
        var maskedUpi = !string.IsNullOrWhiteSpace(p.UpiIdSnapshot) ? MaskUpiId(p.UpiIdSnapshot) : null;

        return new PayoutItemDto
        {
            Id = p.Id,
            PayoutNumber = p.PayoutNumber,
            Amount = p.Amount,
            Status = p.Status.ToString(),
            Method = p.Method.ToString(),
            RequestedAt = p.RequestedAt,
            ProcessedAt = p.ProcessedAt,
            PaidAt = p.PaidAt,
            Reference = p.Reference,
            MaskedBankAccount = $"{maskedAccount} ({p.IfscCodeSnapshot})",
            MaskedUpiId = maskedUpi,
            Notes = p.Notes,
            FailureReason = p.FailureReason
        };
    }

    private static string MaskAccountNumber(string account)
    {
        if (string.IsNullOrWhiteSpace(account)) return "****";
        if (account.Length <= 4) return "**** " + account;
        return "**** **** " + account[^4..];
    }

    private static string MaskUpiId(string upi)
    {
        var atIdx = upi.IndexOf('@');
        if (atIdx <= 2) return upi;
        return upi[..2] + "***" + upi[atIdx..];
    }
}
