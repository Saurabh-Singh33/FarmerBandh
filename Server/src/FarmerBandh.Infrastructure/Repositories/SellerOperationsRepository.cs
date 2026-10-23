using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class SellerOperationsRepository : ISellerOperationsRepository
{
    private readonly AppDbContext _context;

    public SellerOperationsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Farmer?> GetFarmerByUserIdAsync(Guid userId)
    {
        return await _context.Farmers
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.UserId == userId);
    }

    public async Task<Farmer?> GetFarmerByIdAsync(Guid farmerId)
    {
        return await _context.Farmers
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == farmerId);
    }

    public async Task<BankAccount?> GetBankAccountAsync(Guid farmerId)
    {
        return await _context.BankAccounts
            .FirstOrDefaultAsync(b => b.FarmerId == farmerId);
    }

    public async Task AddBankAccountAsync(BankAccount bankAccount)
    {
        await _context.BankAccounts.AddAsync(bankAccount);
    }

    public Task UpdateBankAccountAsync(BankAccount bankAccount)
    {
        _context.BankAccounts.Update(bankAccount);
        return Task.CompletedTask;
    }

    public Task DeleteBankAccountAsync(BankAccount bankAccount)
    {
        _context.BankAccounts.Remove(bankAccount);
        return Task.CompletedTask;
    }

    public async Task<bool> HasPendingPayoutAsync(Guid farmerId)
    {
        return await _context.Payouts
            .AnyAsync(p => p.FarmerId == farmerId && (p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Processing));
    }

    public async Task<Payout?> GetPayoutByIdAsync(Guid payoutId)
    {
        return await _context.Payouts
            .Include(p => p.Farmer)
            .FirstOrDefaultAsync(p => p.Id == payoutId);
    }

    public async Task<Payout?> GetPayoutByNumberAsync(string payoutNumber)
    {
        return await _context.Payouts
            .FirstOrDefaultAsync(p => p.PayoutNumber == payoutNumber);
    }

    public async Task AddPayoutAsync(Payout payout)
    {
        await _context.Payouts.AddAsync(payout);
    }

    public Task UpdatePayoutAsync(Payout payout)
    {
        _context.Payouts.Update(payout);
        return Task.CompletedTask;
    }

    public async Task<(IEnumerable<Payout> Items, int TotalCount)> GetPayoutsAsync(Guid farmerId, PayoutStatus? status, int page, int pageSize)
    {
        var query = _context.Payouts.AsNoTracking().Where(p => p.FarmerId == farmerId);
        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.RequestedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<List<Payout>> GetAllPayoutsForFarmerAsync(Guid farmerId)
    {
        return await _context.Payouts
            .AsNoTracking()
            .Where(p => p.FarmerId == farmerId)
            .ToListAsync();
    }

    public async Task<VerificationRequest?> GetVerificationRequestByIdAsync(Guid requestId)
    {
        return await _context.VerificationRequests
            .Include(v => v.Farmer)
            .FirstOrDefaultAsync(v => v.Id == requestId);
    }

    public async Task<VerificationRequest?> GetCurrentPendingVerificationRequestAsync(Guid farmerId)
    {
        return await _context.VerificationRequests
            .Where(v => v.FarmerId == farmerId && v.Status == VerificationRequestStatus.Pending)
            .OrderByDescending(v => v.SubmittedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<List<VerificationRequest>> GetVerificationRequestsHistoryAsync(Guid farmerId)
    {
        return await _context.VerificationRequests
            .AsNoTracking()
            .Where(v => v.FarmerId == farmerId)
            .OrderByDescending(v => v.SubmittedAt)
            .ToListAsync();
    }

    public async Task AddVerificationRequestAsync(VerificationRequest request)
    {
        await _context.VerificationRequests.AddAsync(request);
    }

    public Task UpdateVerificationRequestAsync(VerificationRequest request)
    {
        _context.VerificationRequests.Update(request);
        return Task.CompletedTask;
    }

    public async Task<SellerSettings?> GetSellerSettingsAsync(Guid farmerId)
    {
        return await _context.SellerSettings
            .FirstOrDefaultAsync(s => s.FarmerId == farmerId);
    }

    public async Task AddSellerSettingsAsync(SellerSettings settings)
    {
        await _context.SellerSettings.AddAsync(settings);
    }

    public Task UpdateSellerSettingsAsync(SellerSettings settings)
    {
        _context.SellerSettings.Update(settings);
        return Task.CompletedTask;
    }

    public async Task<List<Order>> GetDeliveredOrdersAsync(Guid farmerId)
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.SellerId == farmerId && o.Status == OrderStatus.Delivered)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalRefundsForFarmerAsync(Guid farmerId)
    {
        return await _context.Refunds
            .Where(r => r.SellerId == farmerId && r.Status == RefundStatus.Processed)
            .SumAsync(r => (decimal?)r.Amount) ?? 0m;
    }

    public async Task<List<Order>> GetRecentOrdersAsync(Guid farmerId, int count)
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(o => o.Buyer)
                .ThenInclude(b => b.User)
            .Where(o => o.SellerId == farmerId)
            .OrderByDescending(o => o.PlacedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<List<Negotiation>> GetRecentNegotiationsAsync(Guid farmerId, int count)
    {
        return await _context.Negotiations
            .AsNoTracking()
            .Include(n => n.Buyer)
                .ThenInclude(b => b.User)
            .Include(n => n.Product)
            .Where(n => n.FarmerId == farmerId)
            .OrderByDescending(n => n.LastMessageAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<int> GetPendingOrdersCountAsync(Guid farmerId)
    {
        return await _context.Orders
            .CountAsync(o => o.SellerId == farmerId && (o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed || o.Status == OrderStatus.Packed || o.Status == OrderStatus.InTransit));
    }

    public async Task<int> GetCompletedOrdersCountAsync(Guid farmerId)
    {
        return await _context.Orders
            .CountAsync(o => o.SellerId == farmerId && o.Status == OrderStatus.Delivered);
    }

    public async Task<int> GetUnreadNegotiationsCountAsync(Guid farmerId, Guid userId)
    {
        return await _context.NegotiationMessages
            .CountAsync(m => m.Negotiation.FarmerId == farmerId && !m.IsRead && m.SenderUserId != userId);
    }

    public async Task<int> GetOpenReturnsCountAsync(Guid farmerId)
    {
        return await _context.ReturnRequests
            .CountAsync(r => r.SellerId == farmerId && (r.Status == ReturnStatus.Requested || r.Status == ReturnStatus.Approved));
    }

    public async Task<int> GetListingCountByStatusAsync(Guid farmerId, ProductStatus status)
    {
        return await _context.Products
            .CountAsync(p => p.FarmerId == farmerId && p.Status == status);
    }

    public async Task<(IEnumerable<Product> Items, int TotalCount)> GetSellerListingsAsync(Guid farmerId, string? search, ProductStatus? status, string? category, int page, int pageSize)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.FarmerId == farmerId && p.Status != ProductStatus.Removed);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) || p.Category.Name.ToLower().Contains(s));
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var cat = category.Trim().ToLower();
            if (Guid.TryParse(cat, out var catId))
            {
                query = query.Where(p => p.CategoryId == catId);
            }
            else
            {
                query = query.Where(p => p.Category.Name.ToLower().Contains(cat) || p.Category.Slug.ToLower() == cat);
            }
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<List<Order>> GetOrdersInDateRangeAsync(Guid farmerId, DateTime from, DateTime to)
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(o => o.Buyer)
                .ThenInclude(b => b.User)
            .Where(o => o.SellerId == farmerId && o.PlacedAt >= from && o.PlacedAt <= to)
            .OrderBy(o => o.PlacedAt)
            .ToListAsync();
    }

    public async Task<List<OrderItem>> GetOrderItemsInDateRangeAsync(Guid farmerId, DateTime from, DateTime to)
    {
        return await _context.OrderItems
            .AsNoTracking()
            .Include(oi => oi.Product)
                .ThenInclude(p => p.Category)
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.SellerId == farmerId && oi.Order.PlacedAt >= from && oi.Order.PlacedAt <= to)
            .ToListAsync();
    }

    public async Task<List<Review>> GetReviewsForFarmerAsync(Guid farmerId)
    {
        return await _context.Reviews
            .AsNoTracking()
            .Include(r => r.Product)
            .Where(r => r.Product.FarmerId == farmerId)
            .ToListAsync();
    }

    public async Task<List<Product>> GetAllFarmerProductsAsync(Guid farmerId)
    {
        return await _context.Products
            .Where(p => p.FarmerId == farmerId)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
