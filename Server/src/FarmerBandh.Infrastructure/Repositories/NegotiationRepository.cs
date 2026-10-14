using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class NegotiationRepository : INegotiationRepository
{
    private readonly AppDbContext _context;

    public NegotiationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Negotiation?> GetByIdAsync(Guid id, bool includeMessages = false)
    {
        var query = _context.Negotiations
            .Include(n => n.Buyer)
                .ThenInclude(b => b!.User)
            .Include(n => n.Farmer)
                .ThenInclude(f => f!.User)
            .Include(n => n.Product)
            .Include(n => n.CurrentOfferByUser)
            .AsQueryable();

        if (includeMessages)
        {
            query = query.Include(n => n.Messages.OrderBy(m => m.CreatedAt))
                .ThenInclude(m => m.SenderUser);
        }

        return await query.FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<Negotiation?> GetActiveNegotiationAsync(Guid buyerId, Guid farmerId, Guid productId)
    {
        return await _context.Negotiations
            .FirstOrDefaultAsync(n => n.BuyerId == buyerId &&
                                      n.FarmerId == farmerId &&
                                      n.ProductId == productId &&
                                      (n.Status == NegotiationStatus.Open || n.Status == NegotiationStatus.Countered));
    }

    public async Task<IEnumerable<Negotiation>> GetBuyerNegotiationsAsync(Guid buyerId, NegotiationStatus? status = null, string? search = null)
    {
        var query = _context.Negotiations
            .Include(n => n.Product)
            .Include(n => n.Farmer)
                .ThenInclude(f => f!.User)
            .Include(n => n.Buyer)
                .ThenInclude(b => b!.User)
            .Include(n => n.Messages)
            .Where(n => n.BuyerId == buyerId);

        if (status.HasValue)
        {
            query = query.Where(n => n.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(n => (n.Product != null && n.Product.Name.ToLower().Contains(term)) ||
                                     (n.Farmer != null && n.Farmer.FarmName.ToLower().Contains(term)));
        }

        return await query.OrderByDescending(n => n.LastMessageAt).ToListAsync();
    }

    public async Task<IEnumerable<Negotiation>> GetSellerNegotiationsAsync(Guid farmerId, NegotiationStatus? status = null, string? search = null)
    {
        var query = _context.Negotiations
            .Include(n => n.Product)
            .Include(n => n.Farmer)
                .ThenInclude(f => f!.User)
            .Include(n => n.Buyer)
                .ThenInclude(b => b!.User)
            .Include(n => n.Messages)
            .Where(n => n.FarmerId == farmerId);

        if (status.HasValue)
        {
            query = query.Where(n => n.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(n => (n.Product != null && n.Product.Name.ToLower().Contains(term)) ||
                                     (n.Buyer != null && n.Buyer.User != null && n.Buyer.User.FullName.ToLower().Contains(term)));
        }

        return await query.OrderByDescending(n => n.LastMessageAt).ToListAsync();
    }

    public async Task<int> GetUnreadCountForUserAsync(Guid userId)
    {
        return await _context.NegotiationMessages
            .Where(m => !m.IsRead &&
                        m.SenderUserId != userId &&
                        (m.Negotiation!.Buyer!.UserId == userId || m.Negotiation!.Farmer!.UserId == userId))
            .CountAsync();
    }

    public async Task<IEnumerable<Negotiation>> GetExpiredNegotiationsAsync(DateTime threshold)
    {
        return await _context.Negotiations
            .Include(n => n.Buyer)
                .ThenInclude(b => b!.User)
            .Include(n => n.Farmer)
                .ThenInclude(f => f!.User)
            .Where(n => (n.Status == NegotiationStatus.Open || n.Status == NegotiationStatus.Countered) &&
                        n.ExpiresAt < threshold)
            .ToListAsync();
    }

    public async Task AddAsync(Negotiation negotiation)
    {
        await _context.Negotiations.AddAsync(negotiation);
    }

    public async Task AddMessageAsync(NegotiationMessage message)
    {
        await _context.NegotiationMessages.AddAsync(message);
    }

    public async Task MarkMessagesAsReadAsync(Guid negotiationId, Guid excludingUserId)
    {
        var unread = await _context.NegotiationMessages
            .Where(m => m.NegotiationId == negotiationId && !m.IsRead && m.SenderUserId != excludingUserId)
            .ToListAsync();

        if (unread.Any())
        {
            var now = DateTime.UtcNow;
            foreach (var msg in unread)
            {
                msg.IsRead = true;
                msg.ReadAt = now;
            }
        }
    }

    public Task UpdateAsync(Negotiation negotiation)
    {
        _context.Negotiations.Update(negotiation);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
