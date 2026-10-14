namespace FarmerBandh.Application.DTOs.Admin;

public class AdminDashboardDto
{
    public UserKpis users { get; set; } = new();
    public OrderKpis orders { get; set; } = new();
    public RevenueKpis revenue { get; set; } = new();
    public ListingKpis listings { get; set; } = new();
    public VerificationKpis verifications { get; set; } = new();
    public PayoutKpis payouts { get; set; } = new();
    public RefundKpis refunds { get; set; } = new();
    public DisputeKpis disputes { get; set; } = new();
    public List<ChartDataPoint> revenueChart { get; set; } = new();
    public List<OrderChartPoint> ordersChart { get; set; } = new();
    public List<UserChartPoint> userGrowthChart { get; set; } = new();
    public List<CategorySplitPoint> categorySplit { get; set; } = new();
    public List<RecentActivityItem> recentActivity { get; set; } = new();
}

public class UserKpis
{
    public int total { get; set; }
    public int buyers { get; set; }
    public int farmers { get; set; }
    public int admins { get; set; }
    public int newThisMonth { get; set; }
    public int suspended { get; set; }
}

public class OrderKpis
{
    public int total { get; set; }
    public int today { get; set; }
    public int thisWeek { get; set; }
    public int thisMonth { get; set; }
    public int pending { get; set; }
    public int delivered { get; set; }
    public int cancelled { get; set; }
    public int disputed { get; set; }
}

public class RevenueKpis
{
    public decimal gmvThisMonth { get; set; }
    public decimal gmvAllTime { get; set; }
    public decimal platformFeesThisMonth { get; set; }
    public decimal commissionThisMonth { get; set; }
}

public class ListingKpis
{
    public int active { get; set; }
    public int draft { get; set; }
    public int outOfStock { get; set; }
    public int removed { get; set; }
    public int pendingVerification { get; set; }
}

public class VerificationKpis
{
    public int pending { get; set; }
    public int approvedThisMonth { get; set; }
}

public class PayoutKpis
{
    public int pending { get; set; }
    public decimal pendingAmount { get; set; }
    public int paidThisMonth { get; set; }
    public decimal paidAmountThisMonth { get; set; }
}

public class RefundKpis
{
    public int pending { get; set; }
    public int processedThisMonth { get; set; }
}

public class DisputeKpis
{
    public int open { get; set; }
    public int escalated { get; set; }
    public int resolvedThisMonth { get; set; }
}

public class ChartDataPoint
{
    public string month { get; set; } = string.Empty;
    public decimal revenue { get; set; }
}

public class OrderChartPoint
{
    public string month { get; set; } = string.Empty;
    public int orders { get; set; }
}

public class UserChartPoint
{
    public string month { get; set; } = string.Empty;
    public int users { get; set; }
}

public class CategorySplitPoint
{
    public string category { get; set; } = string.Empty;
    public decimal revenue { get; set; }
    public decimal percentage { get; set; }
}

public class RecentActivityItem
{
    public Guid id { get; set; }
    public string action { get; set; } = string.Empty;
    public string summary { get; set; } = string.Empty;
    public string actorName { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}
