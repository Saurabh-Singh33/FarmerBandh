using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Application.DTOs.Admin;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminRepository
{
    // Dashboard & Stats
    Task<AdminDashboardDto> GetDashboardAsync();

    // Users
    Task<(IEnumerable<AdminUserListItemDto> Items, int TotalCount)> GetUsersAsync(AdminUserQuery query);
    Task<AdminUserDetailDto?> GetUserDetailAsync(Guid id);
    Task<User?> GetUserByIdAsync(Guid id);
    Task UpdateUserAsync(User user);

    // Farmers & Verifications
    Task<(IEnumerable<AdminVerificationListItemDto> Items, int TotalCount)> GetVerificationsAsync(AdminVerificationQuery query);
    Task<AdminVerificationDetailDto?> GetVerificationDetailAsync(Guid id);
    Task<VerificationRequest?> GetVerificationRequestByIdAsync(Guid id);
    Task UpdateVerificationRequestAsync(VerificationRequest request);
    Task<Farmer?> GetFarmerByIdAsync(Guid farmerId);
    Task UpdateFarmerAsync(Farmer farmer);

    // Listings
    Task<(IEnumerable<AdminListingListItemDto> Items, int TotalCount)> GetListingsAsync(AdminListingQuery query);
    Task<AdminListingDetailDto?> GetListingDetailAsync(Guid id);
    Task<Product?> GetProductByIdAsync(Guid id);
    Task UpdateProductAsync(Product product);
    Task<List<FeaturedListingItemDto>> GetFeaturedListingsAsync();
    Task<FeaturedListing?> GetFeaturedListingByProductIdAsync(Guid productId);
    Task AddFeaturedListingAsync(FeaturedListing featuredListing);
    Task RemoveFeaturedListingAsync(FeaturedListing featuredListing);
    Task UpdateFeaturedListingsOrderAsync(List<FeaturedOrderItem> items);

    // Orders
    Task<(IEnumerable<AdminOrderListItemDto> Items, int TotalCount)> GetOrdersAsync(AdminOrderQuery query);
    Task<AdminOrderDetailDto?> GetOrderDetailAsync(Guid id);
    Task<Order?> GetOrderByIdAsync(Guid id);
    Task UpdateOrderAsync(Order order);
    Task AddOrderStatusHistoryAsync(OrderStatusHistory history);

    // Disputes
    Task<(IEnumerable<AdminDisputeListItemDto> Items, int TotalCount)> GetDisputesAsync(AdminDisputeQuery query);
    Task<AdminDisputeDetailDto?> GetDisputeDetailAsync(Guid id);
    Task<Dispute?> GetDisputeByIdAsync(Guid id);
    Task UpdateDisputeAsync(Dispute dispute);
    Task AddDisputeMessageAsync(DisputeMessage message);

    // Payouts
    Task<(IEnumerable<AdminPayoutListItemDto> Items, int TotalCount)> GetPayoutsAsync(AdminPayoutQuery query);
    Task<AdminPayoutDetailDto?> GetPayoutDetailAsync(Guid id);
    Task<Payout?> GetPayoutByIdAsync(Guid id);
    Task UpdatePayoutAsync(Payout payout);
    Task<List<Payout>> GetPayoutsByIdsAsync(List<Guid> ids);

    // Refunds
    Task<(IEnumerable<AdminRefundListItemDto> Items, int TotalCount)> GetRefundsAsync(AdminRefundQuery query);
    Task<AdminRefundDetailDto?> GetRefundDetailAsync(Guid id);
    Task<Refund?> GetRefundByIdAsync(Guid id);
    Task AddRefundAsync(Refund refund);
    Task UpdateRefundAsync(Refund refund);

    // Reports
    Task<AdminReportOverviewDto> GetReportOverviewAsync(DateTime? from, DateTime? to);
    Task<List<AdminRevenueSeriesPoint>> GetRevenueReportAsync(string granularity, DateTime? from, DateTime? to);
    Task<List<AdminUserGrowthSeriesPoint>> GetUserGrowthReportAsync(DateTime? from, DateTime? to);
    Task<List<AdminTopFarmerDto>> GetTopFarmersAsync(int limit, DateTime? from, DateTime? to);
    Task<List<AdminTopBuyerDto>> GetTopBuyersAsync(int limit, DateTime? from, DateTime? to);
    Task<List<AdminTopProductDto>> GetTopProductsAsync(int limit, DateTime? from, DateTime? to);
    Task<List<AdminCategoryReportDto>> GetCategoryReportAsync(DateTime? from, DateTime? to);
    Task<List<AdminLocationReportDto>> GetLocationReportAsync(DateTime? from, DateTime? to);

    // Coupons
    Task<(IEnumerable<AdminCouponDto> Items, int TotalCount)> GetCouponsAsync(AdminCouponQuery query);
    Task<Coupon?> GetCouponByIdAsync(Guid id);
    Task<Coupon?> GetCouponByCodeAsync(string code);
    Task AddCouponAsync(Coupon coupon);
    Task UpdateCouponAsync(Coupon coupon);
    Task DeleteCouponAsync(Coupon coupon);

    // Categories
    Task<List<AdminCategoryDto>> GetCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(Guid id);
    Task<Category?> GetCategoryBySlugAsync(string slug);
    Task<int> GetActiveProductCountForCategoryAsync(Guid categoryId);
    Task AddCategoryAsync(Category category);
    Task UpdateCategoryAsync(Category category);
    Task UpdateCategoriesOrderAsync(List<CategoryOrderItem> items);

    // Platform Settings
    Task<PlatformSetting> GetPlatformSettingsAsync();
    Task UpdatePlatformSettingsAsync(PlatformSetting settings);

    // Activity Logs
    Task<(IEnumerable<AdminActivityLogListItemDto> Items, int TotalCount)> GetActivityLogsAsync(AdminActivityLogQuery query);
    Task<AdminActivityLogDetailDto?> GetActivityLogDetailAsync(Guid id);
    Task<List<ActivityLog>> GetActivityLogsForExportAsync(AdminActivityLogQuery query);

    Task SaveChangesAsync();
}
