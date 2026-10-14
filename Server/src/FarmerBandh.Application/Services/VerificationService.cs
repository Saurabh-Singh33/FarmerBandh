using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class VerificationService : IVerificationService
{
    private readonly ISellerOperationsRepository _repository;

    public VerificationService(ISellerOperationsRepository repository)
    {
        _repository = repository;
    }

    public async Task<VerificationStatusDto> GetVerificationStatusAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        string statusString = farmer.Verified switch
        {
            2 => "Verified",
            1 => "Pending",
            _ => "Unverified"
        };

        var currentPending = await _repository.GetCurrentPendingVerificationRequestAsync(farmer.Id);
        var history = await _repository.GetVerificationRequestsHistoryAsync(farmer.Id);

        var currentRequestSummary = currentPending != null ? MapToDto(currentPending) : (history.Count > 0 ? MapToDto(history[0]) : null);
        bool canSubmit = farmer.Verified != 2 && currentPending == null;

        return new VerificationStatusDto
        {
            FarmerVerified = statusString,
            CurrentRequest = currentRequestSummary,
            CanSubmit = canSubmit,
            History = history.Select(MapToDto).ToList()
        };
    }

    public async Task<VerificationRequestSummaryDto> SubmitVerificationAsync(Guid userId, SubmitVerificationRequest request)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        if (farmer.Verified == 2)
        {
            throw new InvalidOperationException("Your farm account is already fully verified.");
        }

        var existingPending = await _repository.GetCurrentPendingVerificationRequestAsync(farmer.Id);
        if (existingPending != null)
        {
            throw new InvalidOperationException("You already have an active verification request under review.");
        }

        var now = DateTime.UtcNow;
        var randomSuffix = Random.Shared.Next(1000, 9999);
        var requestNumber = $"FB-VR-{now:yyyyMMdd}-{randomSuffix}";

        var vr = new VerificationRequest
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            RequestNumber = requestNumber,
            AadhaarNumber = request.AadhaarNumber?.Trim(),
            LandRecordUrl = request.LandRecordUrl?.Trim(),
            SelfieUrl = request.SelfieUrl?.Trim(),
            Notes = request.Notes?.Trim(),
            Status = VerificationRequestStatus.Pending,
            SubmittedAt = now
        };

        farmer.Verified = 1; // Pending

        await _repository.AddVerificationRequestAsync(vr);
        await _repository.SaveChangesAsync();

        return MapToDto(vr);
    }

    public async Task<VerificationRequestSummaryDto> MockApproveAsync(Guid userId, Guid requestId)
    {
        var request = await _repository.GetVerificationRequestByIdAsync(requestId);
        if (request == null) throw new KeyNotFoundException("Verification request not found.");

        var farmer = request.Farmer ?? await _repository.GetFarmerByIdAsync(request.FarmerId);
        if (farmer == null) throw new KeyNotFoundException("Associated farmer not found.");

        var now = DateTime.UtcNow;
        request.Status = VerificationRequestStatus.Approved;
        request.ReviewedAt = now;
        request.ReviewedByUserId = userId;
        request.RejectionReason = null;

        farmer.Verified = 2; // Verified

        await _repository.UpdateVerificationRequestAsync(request);
        await _repository.SaveChangesAsync();

        return MapToDto(request);
    }

    public async Task<VerificationRequestSummaryDto> MockRejectAsync(Guid userId, Guid requestId, MockRejectVerificationRequest rejectReq)
    {
        var request = await _repository.GetVerificationRequestByIdAsync(requestId);
        if (request == null) throw new KeyNotFoundException("Verification request not found.");

        var farmer = request.Farmer ?? await _repository.GetFarmerByIdAsync(request.FarmerId);
        if (farmer == null) throw new KeyNotFoundException("Associated farmer not found.");

        var now = DateTime.UtcNow;
        request.Status = VerificationRequestStatus.Rejected;
        request.ReviewedAt = now;
        request.ReviewedByUserId = userId;
        request.RejectionReason = rejectReq.Reason?.Trim() ?? "Document verification failed. Please re-submit valid land records.";

        farmer.Verified = 0; // Unverified

        await _repository.UpdateVerificationRequestAsync(request);
        await _repository.SaveChangesAsync();

        return MapToDto(request);
    }

    private static VerificationRequestSummaryDto MapToDto(VerificationRequest vr)
    {
        return new VerificationRequestSummaryDto
        {
            Id = vr.Id,
            RequestNumber = vr.RequestNumber,
            Status = vr.Status.ToString(),
            SubmittedAt = vr.SubmittedAt,
            ReviewedAt = vr.ReviewedAt,
            RejectionReason = vr.RejectionReason,
            Notes = vr.Notes
        };
    }
}
