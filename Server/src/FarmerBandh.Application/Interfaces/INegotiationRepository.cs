using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Interfaces;

public interface INegotiationRepository
{
    Task<Negotiation?> GetByIdAsync(Guid id, bool includeMessages = false);
    Task<Negotiation?> GetActiveNegotiationAsync(Guid buyerId, Guid farmerId, Guid productId);
    Task<IEnumerable<Negotiation>> GetBuyerNegotiationsAsync(Guid buyerId, NegotiationStatus? status = null, string? search = null);
    Task<IEnumerable<Negotiation>> GetSellerNegotiationsAsync(Guid farmerId, NegotiationStatus? status = null, string? search = null);
    Task<int> GetUnreadCountForUserAsync(Guid userId);
    Task<IEnumerable<Negotiation>> GetExpiredNegotiationsAsync(DateTime threshold);
    Task AddAsync(Negotiation negotiation);
    Task AddMessageAsync(NegotiationMessage message);
    Task MarkMessagesAsReadAsync(Guid negotiationId, Guid excludingUserId);
    Task UpdateAsync(Negotiation negotiation);
    Task SaveChangesAsync();
}
