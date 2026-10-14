using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Reviews;

namespace FarmerBandh.Application.Interfaces;

public interface IReviewService
{
    Task<List<ReviewDto>> CreateOrderReviewsAsync(Guid userId, Guid orderId, CreateOrderReviewsRequest request);
    Task<List<ReviewDto>> GetOrderReviewsAsync(Guid orderId);
    Task<ReviewDto?> GetReviewByOrderAndProductAsync(Guid orderId, Guid productId);
    Task<PagedResultDto<ReviewDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize);
    Task<PagedResultDto<ReviewDto>> GetFarmerReviewsAsync(Guid farmerId, int page, int pageSize);
    Task<ReviewDto> UpdateReviewAsync(Guid userId, Guid reviewId, UpdateReviewRequest request);
    Task DeleteReviewAsync(Guid userId, Guid reviewId);
}

