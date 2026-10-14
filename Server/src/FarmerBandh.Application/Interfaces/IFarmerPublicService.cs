using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Farmers;
using FarmerBandh.Application.DTOs.Reviews;

namespace FarmerBandh.Application.Interfaces;

public interface IFarmerPublicService
{
    Task<FarmerPublicProfileDto> GetPublicProfileAsync(Guid farmerId);
    Task<PagedResultDto<ProductSummaryDto>> GetFarmerListingsAsync(Guid farmerId, int page = 1, int pageSize = 12);
    Task<PagedResultDto<ReviewDto>> GetFarmerReviewsAsync(Guid farmerId, int page = 1, int pageSize = 10);
}
