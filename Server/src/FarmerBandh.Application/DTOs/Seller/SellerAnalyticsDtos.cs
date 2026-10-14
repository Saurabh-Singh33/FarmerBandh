namespace FarmerBandh.Application.DTOs.Seller;

public class AnalyticsOverviewDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public decimal TotalItemsSold { get; set; }
    public int UniqueBuyers { get; set; }
    public int NewBuyers { get; set; }
    public decimal ReturnRate { get; set; }
    public decimal AverageRating { get; set; }
}

public class RevenueTimeSeriesPointDto
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}

public class TopProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitsSold { get; set; }
    public decimal Revenue { get; set; }
    public decimal Rating { get; set; }
}

public class CategoryBreakdownDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Percentage { get; set; }
}

public class BuyerLocationDto
{
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public int Orders { get; set; }
    public decimal Revenue { get; set; }
}

public class OrderStatusDistributionDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
