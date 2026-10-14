using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class FarmerRepository : IFarmerRepository
{
    private readonly AppDbContext _context;

    public FarmerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Farmer?> GetByIdAsync(Guid farmerId)
    {
        return await _context.Farmers
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == farmerId);
    }

    public async Task<Farmer?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Farmers
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.UserId == userId);
    }

    public async Task<int> GetActiveListingsCountAsync(Guid farmerId)
    {
        return await _context.Products
            .Where(p => p.FarmerId == farmerId && p.Status == ProductStatus.Active)
            .CountAsync();
    }

    public async Task<int> GetDeliveredOrdersCountAsync(Guid farmerId)
    {
        return await _context.Orders
            .Where(o => o.SellerId == farmerId && o.Status == OrderStatus.Delivered)
            .CountAsync();
    }

    public async Task<double> GetAverageResponseTimeHoursAsync(Guid farmerId)
    {
        var negotiations = await _context.Negotiations
            .Include(n => n.Messages)
            .Where(n => n.FarmerId == farmerId && n.Messages.Count >= 2)
            .ToListAsync();

        var responseDurations = new List<double>();

        foreach (var neg in negotiations)
        {
            var ordered = neg.Messages.OrderBy(m => m.CreatedAt).ToList();
            var firstBuyerOffer = ordered.FirstOrDefault(m => m.SenderRole == UserRole.Buyer);
            if (firstBuyerOffer != null)
            {
                var firstFarmerReply = ordered.FirstOrDefault(m => m.SenderRole == UserRole.Farmer && m.CreatedAt > firstBuyerOffer.CreatedAt);
                if (firstFarmerReply != null)
                {
                    var hours = (firstFarmerReply.CreatedAt - firstBuyerOffer.CreatedAt).TotalHours;
                    if (hours >= 0)
                    {
                        responseDurations.Add(hours);
                    }
                }
            }
        }

        if (responseDurations.Any())
        {
            return Math.Round(responseDurations.Average(), 1);
        }

        return 2.4; // Default baseline in hours
    }

    public async Task<int> GetReviewCountAsync(Guid farmerId)
    {
        return await _context.Reviews
            .Where(r => r.FarmerId == farmerId)
            .CountAsync();
    }

    public async Task<DateTime?> GetLastOrderDateForBuyerAsync(Guid buyerId, Guid farmerId)
    {
        return await _context.Orders
            .Where(o => o.BuyerId == buyerId && o.SellerId == farmerId)
            .OrderByDescending(o => o.PlacedAt)
            .Select(o => (DateTime?)o.PlacedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Product>> GetActiveProductsAsync(Guid farmerId, int page = 1, int pageSize = 12)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Farmer)
            .Where(p => p.FarmerId == farmerId && p.Status == ProductStatus.Active)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetActiveProductsCountAsync(Guid farmerId)
    {
        return await _context.Products
            .Where(p => p.FarmerId == farmerId && p.Status == ProductStatus.Active)
            .CountAsync();
    }
}
