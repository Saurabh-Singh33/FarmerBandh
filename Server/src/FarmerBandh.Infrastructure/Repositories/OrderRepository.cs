using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Order> CreateOrderAsync(Order order)
    {
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> GetByIdAsync(Guid orderId)
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.Seller)
                .ThenInclude(s => s.User)
            .Include(o => o.Buyer)
                .ThenInclude(b => b.User)
            .Include(o => o.Address)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetBuyerOrdersAsync(Guid buyerId, string? status, string? search, int page, int pageSize)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Seller)
            .Where(o => o.BuyerId == buyerId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var statusEnum))
        {
            query = query.Where(o => o.Status == statusEnum);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var target = search.Trim().ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(target) ||
                                     o.Items.Any(i => i.ProductNameSnapshot.ToLower().Contains(target)));
        }

        int totalCount = await query.CountAsync();

        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(o => o.PlacedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetSellerOrdersAsync(Guid sellerId, string? status, string? search, int page, int pageSize)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Seller)
            .Include(o => o.Buyer)
                .ThenInclude(b => b.User)
            .Where(o => o.SellerId == sellerId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var statusEnum))
        {
            query = query.Where(o => o.Status == statusEnum);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var target = search.Trim().ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(target) ||
                                     o.Buyer.User.FullName.ToLower().Contains(target) ||
                                     o.Items.Any(i => i.ProductNameSnapshot.ToLower().Contains(target)));
        }

        int totalCount = await query.CountAsync();

        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(o => o.PlacedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task UpdateOrderAsync(Order order)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteOrderAsync(Order order)
    {
        // 1. Remove all return requests and children for this order
        var returnRequests = await _context.ReturnRequests
            .Include(r => r.Messages)
            .Include(r => r.Items)
            .Include(r => r.Refund)
            .Where(r => r.OrderId == order.Id)
            .ToListAsync();

        foreach (var rr in returnRequests)
        {
            if (rr.Messages.Any())
            {
                _context.ReturnMessages.RemoveRange(rr.Messages);
            }
            if (rr.Items.Any())
            {
                _context.ReturnItems.RemoveRange(rr.Items);
            }
            if (rr.Refund != null)
            {
                _context.Refunds.Remove(rr.Refund);
            }
            _context.ReturnRequests.Remove(rr);
        }

        // 2. Remove independent refunds for this order
        var refunds = await _context.Refunds.Where(r => r.OrderId == order.Id).ToListAsync();
        if (refunds.Any())
        {
            _context.Refunds.RemoveRange(refunds);
        }

        // 3. Remove disputes and dispute messages for this order
        var disputes = await _context.Disputes
            .Include(d => d.Messages)
            .Where(d => d.OrderId == order.Id)
            .ToListAsync();

        foreach (var d in disputes)
        {
            if (d.Messages.Any())
            {
                _context.DisputeMessages.RemoveRange(d.Messages);
            }
            _context.Disputes.Remove(d);
        }

        // 4. Remove reviews and recalculate ratings
        var reviews = await _context.Reviews.Where(r => r.OrderId == order.Id).ToListAsync();
        if (reviews.Any())
        {
            var productIds = reviews.Select(r => r.ProductId).Distinct().ToList();
            var farmerIds = reviews.Select(r => r.FarmerId).Distinct().ToList();
            _context.Reviews.RemoveRange(reviews);
            await _context.SaveChangesAsync();

            foreach (var pid in productIds)
            {
                var prodReviews = await _context.Reviews.Where(r => r.ProductId == pid).ToListAsync();
                var prod = await _context.Products.FindAsync(pid);
                if (prod != null)
                {
                    prod.Rating = prodReviews.Any() ? (decimal)Math.Round(prodReviews.Average(r => r.Rating), 1) : 0m;
                    prod.RatingCount = prodReviews.Count;
                    _context.Products.Update(prod);
                }
            }
            foreach (var fid in farmerIds)
            {
                var farmerReviews = await _context.Reviews.Where(r => r.FarmerId == fid).ToListAsync();
                var farmer = await _context.Farmers.FindAsync(fid);
                if (farmer != null)
                {
                    farmer.Rating = farmerReviews.Any() ? (decimal)Math.Round(farmerReviews.Average(r => r.Rating), 1) : 0m;
                    _context.Farmers.Update(farmer);
                }
            }
        }

        // 5. Remove order status history
        var histories = await _context.OrderStatusHistories.Where(h => h.OrderId == order.Id).ToListAsync();
        if (histories.Any())
        {
            _context.OrderStatusHistories.RemoveRange(histories);
        }

        // 6. Remove order items
        var items = await _context.OrderItems.Where(i => i.OrderId == order.Id).ToListAsync();
        if (items.Any())
        {
            _context.OrderItems.RemoveRange(items);
        }

        // 7. Remove order itself
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetActiveBuyerOrdersCountAsync(Guid buyerId)
    {
        return await _context.Orders
            .CountAsync(o => o.BuyerId == buyerId &&
                             (o.Status == OrderStatus.Pending ||
                              o.Status == OrderStatus.Confirmed ||
                              o.Status == OrderStatus.Packed ||
                              o.Status == OrderStatus.InTransit));
    }
}

