using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IReviewRepository
{
    Task<List<Review>> CreateRangeAsync(IEnumerable<Review> reviews);
    Task<Review?> GetByIdAsync(Guid id);
    Task<bool> HasReviewedOrderAsync(Guid orderId);
    Task<List<Review>> GetByOrderIdAsync(Guid orderId);
    Task<Review?> GetByOrderAndProductAsync(Guid orderId, Guid productId);
    Task<(IEnumerable<Review> Items, int TotalCount, double AverageRating)> GetProductReviewsAsync(Guid productId, int page, int pageSize);
    Task<(IEnumerable<Review> Items, int TotalCount, double AverageRating)> GetFarmerReviewsAsync(Guid farmerId, int page, int pageSize);
    Task UpdateAsync(Review review);
    Task DeleteAsync(Review review);
    Task RecalculateProductRatingAsync(Guid productId);
    Task RecalculateFarmerRatingAsync(Guid farmerId);
}

