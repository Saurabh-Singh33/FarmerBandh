using System.Globalization;
using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class SellerAnalyticsService : ISellerAnalyticsService
{
    private readonly ISellerOperationsRepository _repository;

    public SellerAnalyticsService(ISellerOperationsRepository repository)
    {
        _repository = repository;
    }

    public async Task<AnalyticsOverviewDto> GetOverviewAsync(Guid userId, DateTime? from, DateTime? to)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;

        var orders = await _repository.GetOrdersInDateRangeAsync(farmer.Id, fromDate, toDate);
        var orderItems = await _repository.GetOrderItemsInDateRangeAsync(farmer.Id, fromDate, toDate);

        var deliveredOrders = orders.Where(o => o.Status == OrderStatus.Delivered).ToList();
        decimal totalRevenue = deliveredOrders.Sum(o => o.TotalAmount);
        if (totalRevenue == 0 && orders.Count > 0)
        {
            totalRevenue = orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount);
        }

        int totalOrders = orders.Count;
        decimal aov = totalOrders > 0 ? Math.Round(totalRevenue / totalOrders, 2) : 0;
        decimal totalItemsSold = orderItems.Sum(oi => oi.QuantityQuintal);

        var uniqueBuyers = orders.Select(o => o.BuyerId).Distinct().Count();

        // New buyers: buyers whose very first order with this seller was in this window
        var allDelivered = await _repository.GetDeliveredOrdersAsync(farmer.Id);
        var previousBuyers = allDelivered.Where(o => o.PlacedAt < fromDate).Select(o => o.BuyerId).ToHashSet();
        var currentBuyers = orders.Select(o => o.BuyerId).Distinct();
        var newBuyers = currentBuyers.Count(bId => !previousBuyers.Contains(bId));

        int openReturns = await _repository.GetOpenReturnsCountAsync(farmer.Id);
        decimal returnRate = totalOrders > 0 ? Math.Round((decimal)openReturns / totalOrders, 3) : 0;

        var reviews = await _repository.GetReviewsForFarmerAsync(farmer.Id);
        decimal avgRating = reviews.Count > 0 ? Math.Round((decimal)reviews.Average(r => r.Rating), 1) : farmer.Rating;

        return new AnalyticsOverviewDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = aov,
            TotalItemsSold = totalItemsSold,
            UniqueBuyers = uniqueBuyers,
            NewBuyers = newBuyers,
            ReturnRate = returnRate,
            AverageRating = avgRating
        };
    }

    public async Task<List<RevenueTimeSeriesPointDto>> GetRevenueTimeSeriesAsync(Guid userId, string? granularity, DateTime? from, DateTime? to)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;
        var gran = granularity?.ToLowerInvariant() ?? "day";

        var orders = await _repository.GetOrdersInDateRangeAsync(farmer.Id, fromDate, toDate);
        var validOrders = orders.Where(o => o.Status != OrderStatus.Cancelled).ToList();

        var points = new Dictionary<string, (decimal Revenue, int Orders)>();

        if (gran == "month")
        {
            var cur = new DateTime(fromDate.Year, fromDate.Month, 1);
            var end = new DateTime(toDate.Year, toDate.Month, 1);
            while (cur <= end)
            {
                points[cur.ToString("yyyy-MM")] = (0, 0);
                cur = cur.AddMonths(1);
            }

            foreach (var o in validOrders)
            {
                var key = o.PlacedAt.ToString("yyyy-MM");
                if (points.ContainsKey(key))
                {
                    points[key] = (points[key].Revenue + o.TotalAmount, points[key].Orders + 1);
                }
            }
        }
        else if (gran == "week")
        {
            var cur = fromDate;
            while (cur <= toDate)
            {
                var weekNum = ISOWeek.GetWeekOfYear(cur);
                var key = $"{cur.Year}-W{weekNum:D2}";
                if (!points.ContainsKey(key)) points[key] = (0, 0);
                cur = cur.AddDays(7);
            }

            foreach (var o in validOrders)
            {
                var weekNum = ISOWeek.GetWeekOfYear(o.PlacedAt);
                var key = $"{o.PlacedAt.Year}-W{weekNum:D2}";
                if (points.ContainsKey(key))
                {
                    points[key] = (points[key].Revenue + o.TotalAmount, points[key].Orders + 1);
                }
                else
                {
                    points[key] = (o.TotalAmount, 1);
                }
            }
        }
        else // default "day"
        {
            var cur = fromDate.Date;
            var end = toDate.Date;
            while (cur <= end)
            {
                points[cur.ToString("yyyy-MM-dd")] = (0, 0);
                cur = cur.AddDays(1);
            }

            foreach (var o in validOrders)
            {
                var key = o.PlacedAt.ToString("yyyy-MM-dd");
                if (points.ContainsKey(key))
                {
                    points[key] = (points[key].Revenue + o.TotalAmount, points[key].Orders + 1);
                }
            }
        }

        return points.Select(kvp => new RevenueTimeSeriesPointDto
        {
            Period = kvp.Key,
            Revenue = kvp.Value.Revenue,
            Orders = kvp.Value.Orders
        }).OrderBy(p => p.Period).ToList();
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(Guid userId, int limit)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var fromDate = DateTime.UtcNow.AddMonths(-12);
        var toDate = DateTime.UtcNow;

        var orderItems = await _repository.GetOrderItemsInDateRangeAsync(farmer.Id, fromDate, toDate);
        var validItems = orderItems.Where(oi => oi.Order.Status != OrderStatus.Cancelled).ToList();

        var top = validItems
            .GroupBy(oi => new { oi.ProductId, oi.Product?.Name })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name ?? "Crop Produce",
                UnitsSold = g.Sum(x => x.QuantityQuintal),
                Revenue = g.Sum(x => x.LineTotal),
                Rating = g.FirstOrDefault()?.Product?.Rating ?? 4.8m
            })
            .OrderByDescending(p => p.Revenue)
            .Take(limit <= 0 ? 5 : limit)
            .ToList();

        return top;
    }

    public async Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var fromDate = DateTime.UtcNow.AddMonths(-12);
        var toDate = DateTime.UtcNow;

        var orderItems = await _repository.GetOrderItemsInDateRangeAsync(farmer.Id, fromDate, toDate);
        var validItems = orderItems.Where(oi => oi.Order.Status != OrderStatus.Cancelled).ToList();

        decimal totalRev = validItems.Sum(oi => oi.LineTotal);

        var list = validItems
            .GroupBy(oi => new { oi.Product?.CategoryId, CatName = oi.Product?.Category?.Name })
            .Where(g => g.Key.CategoryId.HasValue)
            .Select(g =>
            {
                decimal catRev = g.Sum(x => x.LineTotal);
                decimal pct = totalRev > 0 ? Math.Round((catRev / totalRev) * 100, 1) : 0;
                return new CategoryBreakdownDto
                {
                    CategoryId = g.Key.CategoryId!.Value,
                    CategoryName = g.Key.CatName ?? "Produce",
                    Revenue = catRev,
                    Percentage = pct
                };
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        return list;
    }

    public async Task<List<BuyerLocationDto>> GetBuyerLocationsAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var fromDate = DateTime.UtcNow.AddMonths(-12);
        var toDate = DateTime.UtcNow;

        var orders = await _repository.GetOrdersInDateRangeAsync(farmer.Id, fromDate, toDate);
        var validOrders = orders.Where(o => o.Status != OrderStatus.Cancelled).ToList();

        var locations = validOrders
            .GroupBy(o => new
            {
                State = !string.IsNullOrWhiteSpace(o.Buyer?.State) ? o.Buyer.State : "Gujarat",
                District = !string.IsNullOrWhiteSpace(o.Buyer?.PreferredDistrict) ? o.Buyer.PreferredDistrict : (!string.IsNullOrWhiteSpace(o.Buyer?.City) ? o.Buyer.City : "Ahmedabad")
            })
            .Select(g => new BuyerLocationDto
            {
                State = g.Key.State,
                District = g.Key.District,
                Orders = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderByDescending(l => l.Revenue)
            .ToList();

        return locations;
    }

    public async Task<List<OrderStatusDistributionDto>> GetOrderStatusDistributionAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var orders = await _repository.GetOrdersInDateRangeAsync(farmer.Id, DateTime.UtcNow.AddMonths(-12), DateTime.UtcNow);

        var distribution = orders
            .GroupBy(o => o.Status)
            .Select(g => new OrderStatusDistributionDto
            {
                Status = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderByDescending(d => d.Count)
            .ToList();

        return distribution;
    }
}
