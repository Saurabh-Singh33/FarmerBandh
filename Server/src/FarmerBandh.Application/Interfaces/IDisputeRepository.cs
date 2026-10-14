using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IDisputeRepository
{
    Task<Dispute> CreateAsync(Dispute dispute);
    Task<Dispute?> GetByIdAsync(Guid id);
    Task<bool> HasOpenDisputeAsync(Guid orderId);
    Task<(IEnumerable<Dispute> Items, int TotalCount)> GetUserDisputesAsync(Guid userId, string? status, int page, int pageSize);
    Task AddMessageAsync(DisputeMessage message);
    Task UpdateAsync(Dispute dispute);
}
