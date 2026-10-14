using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Reviews;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly INotificationService _notificationService;

    public ReviewService(
        IReviewRepository reviewRepository,
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        INotificationService notificationService)
    {
        _reviewRepository = reviewRepository;
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _notificationService = notificationService;
    }

    public async Task<List<ReviewDto>> CreateOrderReviewsAsync(Guid userId, Guid orderId, CreateOrderReviewsRequest request)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        if (order.Status != OrderStatus.Delivered)
        {
            throw new InvalidOperationException("Reviews can only be submitted for Delivered orders.");
        }

        var affectedProductIds = new HashSet<Guid>();
        var resultReviews = new List<Review>();

        foreach (var itemReq in request.Items)
        {
            var orderItem = order.Items.FirstOrDefault(i => i.ProductId == itemReq.ProductId);
            if (orderItem != null)
            {
                int rating = Math.Clamp(itemReq.Rating, 1, 5);
                affectedProductIds.Add(itemReq.ProductId);

                // Check if a review already exists for this order & product
                var existingReview = await _reviewRepository.GetByOrderAndProductAsync(order.Id, itemReq.ProductId);
                if (existingReview != null)
                {
                    existingReview.Rating = rating;
                    existingReview.Title = itemReq.Title;
                    existingReview.Body = itemReq.Body;
                    existingReview.UpdatedAt = DateTime.UtcNow;
                    await _reviewRepository.UpdateAsync(existingReview);
                    resultReviews.Add(existingReview);
                }
                else
                {
                    var newReview = new Review
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        ProductId = itemReq.ProductId,
                        BuyerId = buyer.Id,
                        FarmerId = order.SellerId,
                        Rating = rating,
                        Title = itemReq.Title,
                        Body = itemReq.Body,
                        IsVerifiedPurchase = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    var created = await _reviewRepository.CreateRangeAsync(new[] { newReview });
                    resultReviews.AddRange(created);
                }
            }
        }

        if (!resultReviews.Any())
        {
            throw new ArgumentException("No valid product review items provided.");
        }

        // Recalculate rating aggregates
        foreach (var prodId in affectedProductIds)
        {
            await _reviewRepository.RecalculateProductRatingAsync(prodId);
        }
        await _reviewRepository.RecalculateFarmerRatingAsync(order.SellerId);

        // Notify farmer of new review
        var sellerFarmer = await _productRepository.GetFarmerByIdAsync(order.SellerId);
        if (sellerFarmer != null)
        {
            var buyerName = buyer.User?.FullName ?? "A customer";
            var firstItemName = order.Items.FirstOrDefault()?.ProductNameSnapshot ?? "produce";
            await _notificationService.CreateAsync(
                sellerFarmer.UserId,
                NotificationType.REVIEW_RECEIVED,
                "New Review Received",
                $"{buyerName} left a review on your {firstItemName} for order #{order.OrderNumber}.",
                "/seller/dashboard",
                "Review",
                order.Id
            );
        }

        return resultReviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetOrderReviewsAsync(Guid orderId)
    {
        var reviews = await _reviewRepository.GetByOrderIdAsync(orderId);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<ReviewDto?> GetReviewByOrderAndProductAsync(Guid orderId, Guid productId)
    {
        var review = await _reviewRepository.GetByOrderAndProductAsync(orderId, productId);
        return review != null ? MapToDto(review) : null;
    }

    public async Task<PagedResultDto<ReviewDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize)
    {
        var (items, total, average) = await _reviewRepository.GetProductReviewsAsync(productId, page, pageSize);
        var dtos = items.Select(MapToDto).ToList();

        return new PagedResultDto<ReviewDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResultDto<ReviewDto>> GetFarmerReviewsAsync(Guid farmerId, int page, int pageSize)
    {
        var (items, total, average) = await _reviewRepository.GetFarmerReviewsAsync(farmerId, page, pageSize);
        var dtos = items.Select(MapToDto).ToList();

        return new PagedResultDto<ReviewDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ReviewDto> UpdateReviewAsync(Guid userId, Guid reviewId, UpdateReviewRequest request)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var review = await _reviewRepository.GetByIdAsync(reviewId);
        if (review == null || review.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Review not found.");
        }

        // User can edit their review anytime as they wish
        review.Rating = Math.Clamp(request.Rating, 1, 5);
        review.Title = request.Title;
        review.Body = request.Body;
        review.UpdatedAt = DateTime.UtcNow;

        await _reviewRepository.UpdateAsync(review);

        await _reviewRepository.RecalculateProductRatingAsync(review.ProductId);
        await _reviewRepository.RecalculateFarmerRatingAsync(review.FarmerId);

        return MapToDto(review);
    }


    public async Task DeleteReviewAsync(Guid userId, Guid reviewId)
    {
        var buyer = await _productRepository.GetBuyerByUserIdAsync(userId);
        if (buyer == null)
        {
            throw new InvalidOperationException("Buyer profile not found.");
        }

        var review = await _reviewRepository.GetByIdAsync(reviewId);
        if (review == null || review.BuyerId != buyer.Id)
        {
            throw new KeyNotFoundException("Review not found.");
        }

        Guid prodId = review.ProductId;
        Guid farmerId = review.FarmerId;

        await _reviewRepository.DeleteAsync(review);

        await _reviewRepository.RecalculateProductRatingAsync(prodId);
        await _reviewRepository.RecalculateFarmerRatingAsync(farmerId);
    }

    private static ReviewDto MapToDto(Review r)
    {
        string rawName = r.Buyer?.User?.FullName ?? "Buyer";
        string formattedName = FormatMaskedName(rawName);

        return new ReviewDto
        {
            Id = r.Id,
            OrderId = r.OrderId,
            ProductId = r.ProductId,
            ProductName = r.Product?.Name ?? "Product",
            BuyerId = r.BuyerId,
            BuyerName = formattedName,
            FarmerId = r.FarmerId,
            FarmerName = r.Farmer?.FarmName ?? "Farmer",
            Rating = r.Rating,
            Title = r.Title,
            Body = r.Body,
            IsVerifiedPurchase = r.IsVerifiedPurchase,
            CreatedAt = r.CreatedAt
        };
    }

    private static string FormatMaskedName(string fullName)
    {
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "Buyer";
        if (parts.Length == 1) return parts[0];
        return $"{parts[0]} {parts[^1][0]}.";
    }
}
