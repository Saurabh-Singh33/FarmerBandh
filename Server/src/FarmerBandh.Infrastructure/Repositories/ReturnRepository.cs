using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class ReturnRepository : IReturnRepository
{
    private readonly AppDbContext _context;

    public ReturnRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ReturnRequest> CreateAsync(ReturnRequest returnRequest)
    {
        await _context.ReturnRequests.AddAsync(returnRequest);
        await _context.SaveChangesAsync();
        return returnRequest;
    }

    public async Task<ReturnRequest?> GetByIdAsync(Guid id)
    {
        return await _context.ReturnRequests
            .Include(r => r.Order)
            .Include(r => r.Buyer)
                .ThenInclude(b => b.User)
            .Include(r => r.Seller)
            .Include(r => r.Items)
                .ThenInclude(i => i.OrderItem)
            .Include(r => r.Messages)
                .ThenInclude(m => m.SenderUser)
            .Include(r => r.Refund)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<bool> HasOpenReturnAsync(Guid orderId)
    {
        return await _context.ReturnRequests
            .AnyAsync(r => r.OrderId == orderId && r.Status != ReturnStatus.Cancelled && r.Status != ReturnStatus.Rejected);
    }

    public async Task<(IEnumerable<ReturnRequest> Items, int TotalCount)> GetBuyerReturnsAsync(Guid buyerId, string? status, int page, int pageSize)
    {
        var query = _context.ReturnRequests
            .AsNoTracking()
            .Include(r => r.Order)
            .Include(r => r.Seller)
            .Where(r => r.BuyerId == buyerId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReturnStatus>(status, true, out var statusEnum))
        {
            query = query.Where(r => r.Status == statusEnum);
        }

        int totalCount = await query.CountAsync();
        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(r => r.RequestedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<(IEnumerable<ReturnRequest> Items, int TotalCount)> GetSellerReturnsAsync(Guid sellerId, string? status, string? search, int page, int pageSize)
    {
        var query = _context.ReturnRequests
            .AsNoTracking()
            .Include(r => r.Order)
            .Include(r => r.Buyer)
                .ThenInclude(b => b.User)
            .Where(r => r.SellerId == sellerId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReturnStatus>(status, true, out var statusEnum))
        {
            query = query.Where(r => r.Status == statusEnum);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var target = search.Trim().ToLower();
            query = query.Where(r => r.Order.OrderNumber.ToLower().Contains(target) ||
                                     r.Buyer.User.FullName.ToLower().Contains(target) ||
                                     r.Reason.ToLower().Contains(target));
        }

        int totalCount = await query.CountAsync();
        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(r => r.RequestedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task UpdateAsync(ReturnRequest returnRequest)
    {
        _context.ReturnRequests.Update(returnRequest);
        await _context.SaveChangesAsync();
    }

    public async Task AddMessageAsync(ReturnMessage message)
    {
        await _context.ReturnMessages.AddAsync(message);
        await _context.SaveChangesAsync();
    }

    public async Task<ReturnMessage?> GetMessageByIdAsync(Guid messageId)
    {
        return await _context.ReturnMessages.FirstOrDefaultAsync(m => m.Id == messageId);
    }

    public async Task DeleteMessageAsync(ReturnMessage message)
    {
        _context.ReturnMessages.Remove(message);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateMessageAsync(ReturnMessage message)
    {
        _context.ReturnMessages.Update(message);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteReturnAsync(ReturnRequest returnRequest)
    {
        var messages = await _context.ReturnMessages.Where(m => m.ReturnRequestId == returnRequest.Id).ToListAsync();
        if (messages.Any())
        {
            _context.ReturnMessages.RemoveRange(messages);
        }

        var items = await _context.ReturnItems.Where(i => i.ReturnRequestId == returnRequest.Id).ToListAsync();
        if (items.Any())
        {
            _context.ReturnItems.RemoveRange(items);
        }

        var refund = await _context.Refunds.FirstOrDefaultAsync(r => r.ReturnRequestId == returnRequest.Id);
        if (refund != null)
        {
            _context.Refunds.Remove(refund);
        }

        _context.ReturnRequests.Remove(returnRequest);
        await _context.SaveChangesAsync();
    }
}

