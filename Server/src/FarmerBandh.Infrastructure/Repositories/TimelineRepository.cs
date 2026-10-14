using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class TimelineRepository : ITimelineRepository
{
    private readonly AppDbContext _context;

    public TimelineRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(OrderStatusHistory history)
    {
        await _context.OrderStatusHistories.AddAsync(history);
        await _context.SaveChangesAsync();
    }

    public async Task<List<OrderStatusHistory>> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.OrderStatusHistories
            .AsNoTracking()
            .Include(h => h.ChangedByUser)
            .Where(h => h.OrderId == orderId)
            .OrderBy(h => h.CreatedAt)
            .ToListAsync();
    }
}
