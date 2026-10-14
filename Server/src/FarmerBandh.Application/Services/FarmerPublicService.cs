using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Farmers;
using FarmerBandh.Application.DTOs.Reviews;
using FarmerBandh.Application.Interfaces;

namespace FarmerBandh.Application.Services;

public class FarmerPublicService : IFarmerPublicService
{
    private readonly IFarmerRepository _farmerRepository;
    private readonly IReviewService _reviewService;

    public FarmerPublicService(
        IFarmerRepository farmerRepository,
        IReviewService reviewService)
    {
        _farmerRepository = farmerRepository;
        _reviewService = reviewService;
    }

    public async Task<FarmerPublicProfileDto> GetPublicProfileAsync(Guid farmerId)
    {
        var farmer = await _farmerRepository.GetByIdAsync(farmerId);
        if (farmer == null)
            throw new KeyNotFoundException("Farmer not found.");

        var activeListings = await _farmerRepository.GetActiveListingsCountAsync(farmerId);
        var deliveredOrders = await _farmerRepository.GetDeliveredOrdersCountAsync(farmerId);
        var responseTime = await _farmerRepository.GetAverageResponseTimeHoursAsync(farmerId);
        var reviewCount = await _farmerRepository.GetReviewCountAsync(farmerId);

        return new FarmerPublicProfileDto
        {
            Id = farmer.Id,
            FarmName = farmer.FarmName,
            Location = farmer.Location ?? $"{farmer.District}, {farmer.State}",
            State = farmer.State,
            District = farmer.District,
            Rating = farmer.Rating,
            RatingCount = reviewCount,
            Verified = farmer.Verified == 1,
            MemberSince = farmer.MemberSince,
            Bio = null, // Public bio placeholder without PII
            ActiveListingsCount = activeListings,
            TotalOrdersCount = deliveredOrders,
            ResponseTimeHours = responseTime
        };
    }

    public async Task<PagedResultDto<ProductSummaryDto>> GetFarmerListingsAsync(Guid farmerId, int page = 1, int pageSize = 12)
    {
        var farmer = await _farmerRepository.GetByIdAsync(farmerId);
        if (farmer == null)
            throw new KeyNotFoundException("Farmer not found.");

        var products = await _farmerRepository.GetActiveProductsAsync(farmerId, page, pageSize);
        var total = await _farmerRepository.GetActiveProductsCountAsync(farmerId);

        var dtos = products.Select(p => new ProductSummaryDto
        {
            Id = p.Id,
            FarmerId = farmerId,
            Name = p.Name,
            Slug = p.Slug,
            Category = p.Category?.Name ?? "General",
            FarmerName = farmer.FarmName,
            FarmerLocation = farmer.Location ?? $"{farmer.District}, {farmer.State}",
            Verified = farmer.Verified == 1 ? "Verified" : "Unverified",
            Rating = p.Rating,
            PricePerQuintal = p.PricePerQuintal,
            AvailableQuantityQuintal = p.AvailableQuantityQuintal,
            BulkDiscountPercent = p.BulkDiscountPercent,
            BulkDiscountThresholdQuintal = p.BulkDiscountThresholdQuintal,
            ImageUrl = p.ImageUrl,
            State = p.State,
            District = p.District,
            Status = p.Status.ToString()
        }).ToList();

        return new PagedResultDto<ProductSummaryDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResultDto<ReviewDto>> GetFarmerReviewsAsync(Guid farmerId, int page = 1, int pageSize = 10)
    {
        var farmer = await _farmerRepository.GetByIdAsync(farmerId);
        if (farmer == null)
            throw new KeyNotFoundException("Farmer not found.");

        return await _reviewService.GetFarmerReviewsAsync(farmerId, page, pageSize);
    }
}
