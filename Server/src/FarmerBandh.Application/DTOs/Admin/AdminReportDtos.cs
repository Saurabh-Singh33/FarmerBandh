namespace FarmerBandh.Application.DTOs.Admin;

public class AdminReportOverviewDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int NewUsers { get; set; }
    public int NewFarmers { get; set; }
    public int NewBuyers { get; set; }
    public decimal ReturnRate { get; set; }
    public decimal DisputeRate { get; set; }
    public int ActiveListings { get; set; }
    public decimal PlatformFeeRevenue { get; set; }
}

public class AdminRevenueSeriesPoint
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
    public decimal PlatformFees { get; set; }
}

public class AdminUserGrowthSeriesPoint
{
    public string Period { get; set; } = string.Empty;
    public int Buyers { get; set; }
    public int Farmers { get; set; }
    public int Total { get; set; }
}

public class AdminTopFarmerDto
{
    public Guid FarmerId { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
    public decimal Rating { get; set; }
}

public class AdminTopBuyerDto
{
    public Guid BuyerId { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int Orders { get; set; }
}

public class AdminTopProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public decimal UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public class AdminCategoryReportDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
    public decimal Percentage { get; set; }
}

public class AdminLocationReportDto
{
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public int Orders { get; set; }
    public decimal Revenue { get; set; }
    public int UniqueBuyers { get; set; }
}
