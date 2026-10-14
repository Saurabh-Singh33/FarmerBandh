using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Seller;

namespace FarmerBandh.Application.Interfaces;

public interface IPayoutService
{
    Task<PagedResultDto<PayoutItemDto>> GetPayoutsAsync(Guid userId, PayoutQueryParams queryParams);
    Task<PayoutSummaryDto> GetPayoutSummaryAsync(Guid userId);
    Task<PayoutItemDto> RequestPayoutAsync(Guid userId, RequestPayoutDto request);
    Task<PayoutItemDto> MockProcessPayoutAsync(Guid userId, Guid payoutId);
}
