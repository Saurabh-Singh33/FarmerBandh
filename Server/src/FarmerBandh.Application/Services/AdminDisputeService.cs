using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminDisputeService : IAdminDisputeService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminDisputeService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminDisputeListItemDto> Items, int TotalCount)> GetDisputesAsync(AdminDisputeQuery query)
    {
        return await _adminRepository.GetDisputesAsync(query);
    }

    public async Task<AdminDisputeDetailDto?> GetDisputeDetailAsync(Guid id)
    {
        return await _adminRepository.GetDisputeDetailAsync(id);
    }

    public async Task<bool> EscalateDisputeAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var dispute = await _adminRepository.GetDisputeByIdAsync(id);
        if (dispute == null) return false;

        dispute.Status = DisputeStatus.Escalated;
        await _adminRepository.UpdateDisputeAsync(dispute);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "DISPUTE_ESCALATED",
            targetType: "Dispute",
            targetId: dispute.Id,
            summary: $"Admin escalated dispute '{dispute.Subject}' (Order: {dispute.Order?.OrderNumber})",
            metadata: $"{{\"disputeId\":\"{dispute.Id}\",\"orderId\":\"{dispute.OrderId}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> ResolveDisputeAsync(Guid id, AdminResolveDisputeRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var dispute = await _adminRepository.GetDisputeByIdAsync(id);
        if (dispute == null) return false;

        dispute.Status = DisputeStatus.Resolved;
        dispute.ResolvedAt = DateTime.UtcNow;
        dispute.ResolutionNote = $"[Favor: {request.Favor}] {request.ResolutionNote}";
        await _adminRepository.UpdateDisputeAsync(dispute);

        // If favor == "buyer", auto-create a refund (Pending)
        bool refundCreated = false;
        if (request.Favor.Equals("buyer", StringComparison.OrdinalIgnoreCase) && dispute.Order != null)
        {
            var refund = new Refund
            {
                Id = Guid.NewGuid(),
                OrderId = dispute.OrderId,
                BuyerId = dispute.Order.BuyerId,
                SellerId = dispute.Order.SellerId,
                Amount = dispute.Order.TotalAmount,
                Status = RefundStatus.Pending,
                Reference = $"Dispute resolution refund: {request.ResolutionNote}",
                CreatedAt = DateTime.UtcNow
            };
            await _adminRepository.AddRefundAsync(refund);
            refundCreated = true;
        }

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "DISPUTE_RESOLVED",
            targetType: "Dispute",
            targetId: dispute.Id,
            summary: $"Admin resolved dispute '{dispute.Subject}' favoring {request.Favor}. Note: {request.ResolutionNote}",
            metadata: $"{{\"disputeId\":\"{dispute.Id}\",\"favor\":\"{request.Favor}\",\"refundCreated\":{refundCreated.ToString().ToLower()}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> CloseDisputeAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var dispute = await _adminRepository.GetDisputeByIdAsync(id);
        if (dispute == null) return false;

        dispute.Status = DisputeStatus.Closed;
        await _adminRepository.UpdateDisputeAsync(dispute);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "DISPUTE_CLOSED",
            targetType: "Dispute",
            targetId: dispute.Id,
            summary: $"Admin closed dispute '{dispute.Subject}'",
            metadata: $"{{\"disputeId\":\"{dispute.Id}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> PostMessageAsync(Guid id, AdminPostDisputeMessageRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var dispute = await _adminRepository.GetDisputeByIdAsync(id);
        if (dispute == null) return false;

        var message = new DisputeMessage
        {
            Id = Guid.NewGuid(),
            DisputeId = id,
            SenderUserId = currentAdminId,
            SenderRole = UserRole.Admin,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.AddDisputeMessageAsync(message);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "DISPUTE_MESSAGE_POSTED",
            targetType: "Dispute",
            targetId: dispute.Id,
            summary: $"Admin posted message in dispute '{dispute.Subject}'",
            metadata: $"{{\"disputeId\":\"{dispute.Id}\",\"messageLength\":{request.Body.Length}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
