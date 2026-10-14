using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminVerificationService : IAdminVerificationService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminVerificationService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminVerificationListItemDto> Items, int TotalCount)> GetVerificationsAsync(AdminVerificationQuery query)
    {
        return await _adminRepository.GetVerificationsAsync(query);
    }

    public async Task<AdminVerificationDetailDto?> GetVerificationDetailAsync(Guid id)
    {
        return await _adminRepository.GetVerificationDetailAsync(id);
    }

    public async Task<bool> ApproveVerificationAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var v = await _adminRepository.GetVerificationRequestByIdAsync(id);
        if (v == null) return false;

        v.Status = VerificationRequestStatus.Approved;
        v.ReviewedAt = DateTime.UtcNow;
        v.ReviewedByUserId = currentAdminId;
        await _adminRepository.UpdateVerificationRequestAsync(v);

        var farmer = await _adminRepository.GetFarmerByIdAsync(v.FarmerId);
        if (farmer != null)
        {
            farmer.Verified = 2; // Verified
            await _adminRepository.UpdateFarmerAsync(farmer);
        }

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "FARMER_VERIFIED",
            targetType: "Farmer",
            targetId: v.FarmerId,
            summary: $"Approved verification request {v.RequestNumber} for {farmer?.FarmName ?? "Farmer"}",
            metadata: $"{{\"requestId\":\"{v.Id}\",\"requestNumber\":\"{v.RequestNumber}\",\"newStatus\":\"Verified\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> RejectVerificationAsync(Guid id, RejectVerificationRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var v = await _adminRepository.GetVerificationRequestByIdAsync(id);
        if (v == null) return false;

        v.Status = VerificationRequestStatus.Rejected;
        v.RejectionReason = request.Reason;
        v.ReviewedAt = DateTime.UtcNow;
        v.ReviewedByUserId = currentAdminId;
        await _adminRepository.UpdateVerificationRequestAsync(v);

        var farmer = await _adminRepository.GetFarmerByIdAsync(v.FarmerId);
        if (farmer != null)
        {
            farmer.Verified = 0; // Unverified
            await _adminRepository.UpdateFarmerAsync(farmer);
        }

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "FARMER_VERIFICATION_REJECTED",
            targetType: "Farmer",
            targetId: v.FarmerId,
            summary: $"Rejected verification request {v.RequestNumber} for {farmer?.FarmName ?? "Farmer"}. Reason: {request.Reason}",
            metadata: $"{{\"requestId\":\"{v.Id}\",\"requestNumber\":\"{v.RequestNumber}\",\"reason\":\"{request.Reason.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
