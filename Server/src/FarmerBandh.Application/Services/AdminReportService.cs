using System.Text;
using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;

namespace FarmerBandh.Application.Services;

public class AdminReportService : IAdminReportService
{
    private readonly IAdminRepository _adminRepository;

    public AdminReportService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<AdminReportOverviewDto> GetOverviewAsync(DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetReportOverviewAsync(from, to);
    }

    public async Task<List<AdminRevenueSeriesPoint>> GetRevenueSeriesAsync(string granularity, DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetRevenueReportAsync(granularity, from, to);
    }

    public async Task<List<AdminUserGrowthSeriesPoint>> GetUserGrowthSeriesAsync(DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetUserGrowthReportAsync(from, to);
    }

    public async Task<List<AdminTopFarmerDto>> GetTopFarmersAsync(int limit, DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetTopFarmersAsync(limit, from, to);
    }

    public async Task<List<AdminTopBuyerDto>> GetTopBuyersAsync(int limit, DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetTopBuyersAsync(limit, from, to);
    }

    public async Task<List<AdminTopProductDto>> GetTopProductsAsync(int limit, DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetTopProductsAsync(limit, from, to);
    }

    public async Task<List<AdminCategoryReportDto>> GetCategoriesAsync(DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetCategoryReportAsync(from, to);
    }

    public async Task<List<AdminLocationReportDto>> GetLocationsAsync(DateTime? from, DateTime? to)
    {
        return await _adminRepository.GetLocationReportAsync(from, to);
    }

    public async Task<byte[]> ExportCsvAsync(string type, DateTime? from, DateTime? to)
    {
        var sb = new StringBuilder();

        switch (type.ToLower())
        {
            case "revenue":
                sb.AppendLine("Period,Revenue (INR),Orders,Platform Fees (INR)");
                var rev = await _adminRepository.GetRevenueReportAsync("day", from, to);
                foreach (var r in rev)
                {
                    sb.AppendLine($"\"{r.Period}\",{r.Revenue},{r.Orders},{r.PlatformFees}");
                }
                break;

            case "orders":
                sb.AppendLine("Order Number,Buyer,Seller,Amount (INR),Status,Payment Status,Payment Method,Placed At");
                var (orders, _) = await _adminRepository.GetOrdersAsync(new AdminOrderQuery { From = from, To = to, Page = 1, PageSize = 5000 });
                foreach (var o in orders)
                {
                    sb.AppendLine($"\"{o.OrderNumber}\",\"{Escape(o.BuyerName)}\",\"{Escape(o.SellerName)}\",{o.TotalAmount},\"{o.Status}\",\"{o.PaymentStatus}\",\"{o.PaymentMethod}\",\"{o.PlacedAt:yyyy-MM-dd HH:mm:ss}\"");
                }
                break;

            case "users":
                sb.AppendLine("Name,Email,Role,Status,State,District,Joined At,Order Count,Listing Count");
                var (users, _) = await _adminRepository.GetUsersAsync(new AdminUserQuery { Page = 1, PageSize = 5000 });
                foreach (var u in users)
                {
                    sb.AppendLine($"\"{Escape(u.FullName)}\",\"{Escape(u.Email)}\",\"{u.Role}\",\"{u.Status}\",\"{Escape(u.State)}\",\"{Escape(u.District)}\",\"{u.JoinedAt:yyyy-MM-dd HH:mm:ss}\",{u.OrderCount},{u.ListingCount}");
                }
                break;

            case "farmers":
                sb.AppendLine("Farm Name,Revenue (INR),Orders,Rating");
                var topF = await _adminRepository.GetTopFarmersAsync(500, from, to);
                foreach (var f in topF)
                {
                    sb.AppendLine($"\"{Escape(f.FarmName)}\",{f.Revenue},{f.Orders},{f.Rating}");
                }
                break;

            case "listings":
                sb.AppendLine("Product Name,Category,Farmer Name,Farm Name,Price Per Quintal (INR),Available Quintal,Status,Verified");
                var (listings, _) = await _adminRepository.GetListingsAsync(new AdminListingQuery { Page = 1, PageSize = 5000 });
                foreach (var l in listings)
                {
                    sb.AppendLine($"\"{Escape(l.Name)}\",\"{Escape(l.CategoryName)}\",\"{Escape(l.FarmerName)}\",\"{Escape(l.FarmName)}\",{l.PricePerQuintal},{l.AvailableQuantityQuintal},\"{l.Status}\",{l.IsVerified}");
                }
                break;

            case "payouts":
                sb.AppendLine("Payout Number,Farmer,Farm,Amount (INR),Method,Status,Requested At,Paid At,Reference");
                var (payouts, _) = await _adminRepository.GetPayoutsAsync(new AdminPayoutQuery { From = from, To = to, Page = 1, PageSize = 5000 });
                foreach (var p in payouts)
                {
                    sb.AppendLine($"\"{p.PayoutNumber}\",\"{Escape(p.FarmerName)}\",\"{Escape(p.FarmName)}\",{p.Amount},\"{p.Method}\",\"{p.Status}\",\"{p.RequestedAt:yyyy-MM-dd HH:mm:ss}\",\"{p.PaidAt?.ToString("yyyy-MM-dd HH:mm:ss")}\",\"{p.Reference}\"");
                }
                break;

            default:
                sb.AppendLine("Key,Value");
                var overview = await _adminRepository.GetReportOverviewAsync(from, to);
                sb.AppendLine($"TotalRevenue,{overview.TotalRevenue}");
                sb.AppendLine($"TotalOrders,{overview.TotalOrders}");
                sb.AppendLine($"AverageOrderValue,{overview.AverageOrderValue}");
                sb.AppendLine($"NewUsers,{overview.NewUsers}");
                sb.AppendLine($"ActiveListings,{overview.ActiveListings}");
                sb.AppendLine($"PlatformFeeRevenue,{overview.PlatformFeeRevenue}");
                break;
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string Escape(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return text.Replace("\"", "\"\"");
    }
}
