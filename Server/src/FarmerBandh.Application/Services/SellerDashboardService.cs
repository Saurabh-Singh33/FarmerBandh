using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class SellerDashboardService : ISellerDashboardService
{
    private readonly ISellerOperationsRepository _repository;

    public SellerDashboardService(ISellerOperationsRepository repository)
    {
        _repository = repository;
    }

    public async Task<SellerDashboardDto> GetDashboardAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new UnauthorizedAccessException("Farmer profile not found for this account.");
        }

        var now = DateTime.UtcNow;
        var startOfCurrentMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastMonth = startOfCurrentMonth.AddMonths(-1);
        var endOfLastMonth = startOfCurrentMonth.AddTicks(-1);

        // Delivered orders
        var deliveredOrders = await _repository.GetDeliveredOrdersAsync(farmer.Id);

        decimal earningsThisMonth = deliveredOrders
            .Where(o => (o.DeliveredAt ?? o.PlacedAt) >= startOfCurrentMonth)
            .Sum(o => o.TotalAmount);

        decimal earningsLastMonth = deliveredOrders
            .Where(o => (o.DeliveredAt ?? o.PlacedAt) >= startOfLastMonth && (o.DeliveredAt ?? o.PlacedAt) <= endOfLastMonth)
            .Sum(o => o.TotalAmount);

        decimal earningsAllTime = deliveredOrders.Sum(o => o.TotalAmount);

        // Payouts
        var allPayouts = await _repository.GetAllPayoutsForFarmerAsync(farmer.Id);
        decimal pendingPayoutAmount = allPayouts
            .Where(p => p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Processing)
            .Sum(p => p.Amount);

        // Counts
        int activeListings = await _repository.GetListingCountByStatusAsync(farmer.Id, ProductStatus.Active);
        int outOfStock = await _repository.GetListingCountByStatusAsync(farmer.Id, ProductStatus.OutOfStock);
        int pendingOrders = await _repository.GetPendingOrdersCountAsync(farmer.Id);
        int completedOrders = await _repository.GetCompletedOrdersCountAsync(farmer.Id);

        // Reviews
        var reviews = await _repository.GetReviewsForFarmerAsync(farmer.Id);
        decimal avgRating = reviews.Count > 0 ? Math.Round((decimal)reviews.Average(r => r.Rating), 1) : farmer.Rating;
        int ratingCount = reviews.Count;

        int unreadNegs = await _repository.GetUnreadNegotiationsCountAsync(farmer.Id, userId);
        int openReturns = await _repository.GetOpenReturnsCountAsync(farmer.Id);

        string verificationStatus = farmer.Verified switch
        {
            2 => "Verified",
            1 => "Pending",
            _ => "Unverified"
        };

        // Monthly Earnings Chart (Last 12 Months)
        var monthlyChart = new List<MonthlyEarningsPointDto>();
        for (int i = 11; i >= 0; i--)
        {
            var mDate = startOfCurrentMonth.AddMonths(-i);
            var mEnd = mDate.AddMonths(1).AddTicks(-1);
            var monthKey = mDate.ToString("yyyy-MM");
            decimal amount = deliveredOrders
                .Where(o => (o.DeliveredAt ?? o.PlacedAt) >= mDate && (o.DeliveredAt ?? o.PlacedAt) <= mEnd)
                .Sum(o => o.TotalAmount);

            monthlyChart.Add(new MonthlyEarningsPointDto
            {
                Month = monthKey,
                Amount = amount
            });
        }

        // Recent Orders
        var recentOrdersRaw = await _repository.GetRecentOrdersAsync(farmer.Id, 5);
        var recentOrders = recentOrdersRaw.Select(o => new RecentOrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            BuyerName = o.Buyer?.User?.FullName ?? "Buyer",
            Amount = o.TotalAmount,
            Status = o.Status.ToString(),
            PlacedAt = o.PlacedAt
        }).ToList();

        // Recent Negotiations
        var recentNegsRaw = await _repository.GetRecentNegotiationsAsync(farmer.Id, 3);
        var recentNegotiations = recentNegsRaw.Select(n => new RecentNegotiationSummaryDto
        {
            Id = n.Id,
            BuyerName = n.Buyer?.User?.FullName ?? "Buyer",
            ProductName = n.Product?.Name ?? (n.IsBundle ? "Multi-Crop Bundle" : "Produce"),
            CurrentOfferPrice = n.CurrentOfferPrice,
            Status = n.Status.ToString(),
            LastMessageAt = n.LastMessageAt
        }).ToList();

        return new SellerDashboardDto
        {
            EarningsThisMonth = earningsThisMonth,
            EarningsLastMonth = earningsLastMonth,
            EarningsAllTime = earningsAllTime,
            PendingPayoutAmount = pendingPayoutAmount,
            ActiveListingsCount = activeListings,
            OutOfStockCount = outOfStock,
            PendingOrdersCount = pendingOrders,
            CompletedOrdersCount = completedOrders,
            AverageRating = avgRating,
            RatingCount = ratingCount,
            UnreadNegotiationsCount = unreadNegs,
            OpenReturnsCount = openReturns,
            VerificationStatus = verificationStatus,
            MonthlyEarningsChart = monthlyChart,
            RecentOrders = recentOrders,
            RecentNegotiations = recentNegotiations
        };
    }
}
