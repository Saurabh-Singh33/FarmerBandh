using FarmerBandh.Application.DTOs.Seller;

namespace FarmerBandh.Application.Interfaces;

public interface IVerificationService
{
    Task<VerificationStatusDto> GetVerificationStatusAsync(Guid userId);
    Task<VerificationRequestSummaryDto> SubmitVerificationAsync(Guid userId, SubmitVerificationRequest request);
    Task<VerificationRequestSummaryDto> MockApproveAsync(Guid userId, Guid requestId);
    Task<VerificationRequestSummaryDto> MockRejectAsync(Guid userId, Guid requestId, MockRejectVerificationRequest request);
}
