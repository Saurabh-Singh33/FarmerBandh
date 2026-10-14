using FarmerBandh.Application.DTOs.Seller;

namespace FarmerBandh.Application.Interfaces;

public interface ISellerAnalyticsService
{
    Task<AnalyticsOverviewDto> GetOverviewAsync(Guid userId, DateTime? from, DateTime? to);
    Task<List<RevenueTimeSeriesPointDto>> GetRevenueTimeSeriesAsync(Guid userId, string? granularity, DateTime? from, DateTime? to);
    Task<List<TopProductDto>> GetTopProductsAsync(Guid userId, int limit);
    Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(Guid userId);
    Task<List<BuyerLocationDto>> GetBuyerLocationsAsync(Guid userId);
    Task<List<OrderStatusDistributionDto>> GetOrderStatusDistributionAsync(Guid userId);
}
