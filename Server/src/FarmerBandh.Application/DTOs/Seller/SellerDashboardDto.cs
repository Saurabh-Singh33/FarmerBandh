namespace FarmerBandh.Application.DTOs.Seller;

public class SellerDashboardDto
{
    public decimal EarningsThisMonth { get; set; }
    public decimal EarningsLastMonth { get; set; }
    public decimal EarningsAllTime { get; set; }
    public decimal PendingPayoutAmount { get; set; }
    public int ActiveListingsCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int PendingOrdersCount { get; set; }
    public int CompletedOrdersCount { get; set; }
    public decimal AverageRating { get; set; }
    public int RatingCount { get; set; }
    public int UnreadNegotiationsCount { get; set; }
    public int OpenReturnsCount { get; set; }
    public string VerificationStatus { get; set; } = "Unverified";
    public List<MonthlyEarningsPointDto> MonthlyEarningsChart { get; set; } = new();
    public List<RecentOrderSummaryDto> RecentOrders { get; set; } = new();
    public List<RecentNegotiationSummaryDto> RecentNegotiations { get; set; } = new();
}

public class MonthlyEarningsPointDto
{
    public string Month { get; set; } = string.Empty; // format "2026-04"
    public decimal Amount { get; set; }
}

public class RecentOrderSummaryDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string BuyerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime PlacedAt { get; set; }
}

public class RecentNegotiationSummaryDto
{
    public Guid Id { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal CurrentOfferPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime LastMessageAt { get; set; }
}
