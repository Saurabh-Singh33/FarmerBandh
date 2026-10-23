using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Interfaces;

public interface ISellerOperationsRepository
{
    // Farmer resolution
    Task<Farmer?> GetFarmerByUserIdAsync(Guid userId);
    Task<Farmer?> GetFarmerByIdAsync(Guid farmerId);

    // Bank Account
    Task<BankAccount?> GetBankAccountAsync(Guid farmerId);
    Task AddBankAccountAsync(BankAccount bankAccount);
    Task UpdateBankAccountAsync(BankAccount bankAccount);
    Task DeleteBankAccountAsync(BankAccount bankAccount);
    Task<bool> HasPendingPayoutAsync(Guid farmerId);

    // Payouts
    Task<Payout?> GetPayoutByIdAsync(Guid payoutId);
    Task<Payout?> GetPayoutByNumberAsync(string payoutNumber);
    Task AddPayoutAsync(Payout payout);
    Task UpdatePayoutAsync(Payout payout);
    Task<(IEnumerable<Payout> Items, int TotalCount)> GetPayoutsAsync(Guid farmerId, PayoutStatus? status, int page, int pageSize);
    Task<List<Payout>> GetAllPayoutsForFarmerAsync(Guid farmerId);

    // Verification Requests
    Task<VerificationRequest?> GetVerificationRequestByIdAsync(Guid requestId);
    Task<VerificationRequest?> GetCurrentPendingVerificationRequestAsync(Guid farmerId);
    Task<List<VerificationRequest>> GetVerificationRequestsHistoryAsync(Guid farmerId);
    Task AddVerificationRequestAsync(VerificationRequest request);
    Task UpdateVerificationRequestAsync(VerificationRequest request);

    // Seller Settings
    Task<SellerSettings?> GetSellerSettingsAsync(Guid farmerId);
    Task AddSellerSettingsAsync(SellerSettings settings);
    Task UpdateSellerSettingsAsync(SellerSettings settings);

    // Aggregations & Orders
    Task<List<Order>> GetDeliveredOrdersAsync(Guid farmerId);
    Task<decimal> GetTotalRefundsForFarmerAsync(Guid farmerId);
    Task<List<Order>> GetRecentOrdersAsync(Guid farmerId, int count);
    Task<List<Negotiation>> GetRecentNegotiationsAsync(Guid farmerId, int count);
    Task<int> GetPendingOrdersCountAsync(Guid farmerId);
    Task<int> GetCompletedOrdersCountAsync(Guid farmerId);
    Task<int> GetUnreadNegotiationsCountAsync(Guid farmerId, Guid userId);
    Task<int> GetOpenReturnsCountAsync(Guid farmerId);
    Task<int> GetListingCountByStatusAsync(Guid farmerId, ProductStatus status);
    Task<(IEnumerable<Product> Items, int TotalCount)> GetSellerListingsAsync(Guid farmerId, string? search, ProductStatus? status, string? category, int page, int pageSize);

    // Analytics queries
    Task<List<Order>> GetOrdersInDateRangeAsync(Guid farmerId, DateTime from, DateTime to);
    Task<List<OrderItem>> GetOrderItemsInDateRangeAsync(Guid farmerId, DateTime from, DateTime to);
    Task<List<Review>> GetReviewsForFarmerAsync(Guid farmerId);
    Task<List<Product>> GetAllFarmerProductsAsync(Guid farmerId);

    Task SaveChangesAsync();
}
