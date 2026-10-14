using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IRefundRepository
{
    Task<Refund> CreateAsync(Refund refund);
    Task<Refund?> GetByIdAsync(Guid id);
    Task<Refund?> GetByReturnRequestIdAsync(Guid returnRequestId);
    Task<(IEnumerable<Refund> Items, int TotalCount)> GetUserRefundsAsync(Guid userId, bool isSeller, string? status, int page, int pageSize);
    Task UpdateAsync(Refund refund);
}
