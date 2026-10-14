using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Disputes;

namespace FarmerBandh.Application.Interfaces;

public interface IDisputeService
{
    Task<DisputeDetailDto> CreateDisputeAsync(Guid userId, Guid orderId, CreateDisputeRequest request);
    Task<PagedResultDto<DisputeSummaryDto>> GetUserDisputesAsync(Guid userId, string? status, int page, int pageSize);
    Task<DisputeDetailDto> GetDisputeByIdAsync(Guid userId, Guid disputeId);
    Task<DisputeDetailDto> AddMessageAsync(Guid userId, Guid disputeId, PostDisputeMessageRequest request);
    Task<DisputeDetailDto> ResolveDisputeAsync(Guid userId, Guid disputeId, ResolveDisputeRequest request);
    Task<DisputeDetailDto> CloseDisputeAsync(Guid userId, Guid disputeId);
}
