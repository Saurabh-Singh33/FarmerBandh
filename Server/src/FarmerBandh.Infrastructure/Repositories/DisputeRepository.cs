using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class DisputeRepository : IDisputeRepository
{
    private readonly AppDbContext _context;

    public DisputeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Dispute> CreateAsync(Dispute dispute)
    {
        await _context.Disputes.AddAsync(dispute);
        await _context.SaveChangesAsync();
        return dispute;
    }

    public async Task<Dispute?> GetByIdAsync(Guid id)
    {
        return await _context.Disputes
            .Include(d => d.Order)
            .Include(d => d.RaisedByUser)
            .Include(d => d.AgainstUser)
            .Include(d => d.Messages)
                .ThenInclude(m => m.SenderUser)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<bool> HasOpenDisputeAsync(Guid orderId)
    {
        return await _context.Disputes
            .AnyAsync(d => d.OrderId == orderId && d.Status != DisputeStatus.Closed && d.Status != DisputeStatus.Resolved);
    }

    public async Task<(IEnumerable<Dispute> Items, int TotalCount)> GetUserDisputesAsync(Guid userId, string? status, int page, int pageSize)
    {
        var query = _context.Disputes
            .AsNoTracking()
            .Include(d => d.Order)
            .Include(d => d.RaisedByUser)
            .Include(d => d.AgainstUser)
            .Where(d => d.RaisedByUserId == userId || d.AgainstUserId == userId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DisputeStatus>(status, true, out var statusEnum))
        {
            query = query.Where(d => d.Status == statusEnum);
        }

        int totalCount = await query.CountAsync();
        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(d => d.OpenedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task AddMessageAsync(DisputeMessage message)
    {
        await _context.DisputeMessages.AddAsync(message);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Dispute dispute)
    {
        _context.Disputes.Update(dispute);
        await _context.SaveChangesAsync();
    }
}
