using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class RefundRepository : IRefundRepository
{
    private readonly AppDbContext _context;

    public RefundRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Refund> CreateAsync(Refund refund)
    {
        await _context.Refunds.AddAsync(refund);
        await _context.SaveChangesAsync();
        return refund;
    }

    public async Task<Refund?> GetByIdAsync(Guid id)
    {
        return await _context.Refunds
            .Include(rf => rf.Order)
            .Include(rf => rf.Buyer)
                .ThenInclude(b => b.User)
            .Include(rf => rf.Seller)
            .Include(rf => rf.ReturnRequest)
            .FirstOrDefaultAsync(rf => rf.Id == id);
    }

    public async Task<Refund?> GetByReturnRequestIdAsync(Guid returnRequestId)
    {
        return await _context.Refunds
            .FirstOrDefaultAsync(rf => rf.ReturnRequestId == returnRequestId);
    }

    public async Task<(IEnumerable<Refund> Items, int TotalCount)> GetUserRefundsAsync(Guid userId, bool isSeller, string? status, int page, int pageSize)
    {
        var query = _context.Refunds
            .AsNoTracking()
            .Include(rf => rf.Order)
            .Include(rf => rf.Buyer)
                .ThenInclude(b => b.User)
            .Include(rf => rf.Seller)
            .AsQueryable();

        if (isSeller)
        {
            query = query.Where(rf => rf.Seller.UserId == userId);
        }
        else
        {
            query = query.Where(rf => rf.Buyer.UserId == userId);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<RefundStatus>(status, true, out var statusEnum))
        {
            query = query.Where(rf => rf.Status == statusEnum);
        }

        int totalCount = await query.CountAsync();
        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(rf => rf.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task UpdateAsync(Refund refund)
    {
        _context.Refunds.Update(refund);
        await _context.SaveChangesAsync();
    }
}
