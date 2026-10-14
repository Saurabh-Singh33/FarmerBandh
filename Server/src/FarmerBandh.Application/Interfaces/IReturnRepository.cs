using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IReturnRepository
{
    Task<ReturnRequest> CreateAsync(ReturnRequest returnRequest);
    Task<ReturnRequest?> GetByIdAsync(Guid id);
    Task<bool> HasOpenReturnAsync(Guid orderId);
    Task<(IEnumerable<ReturnRequest> Items, int TotalCount)> GetBuyerReturnsAsync(Guid buyerId, string? status, int page, int pageSize);
    Task<(IEnumerable<ReturnRequest> Items, int TotalCount)> GetSellerReturnsAsync(Guid sellerId, string? status, string? search, int page, int pageSize);
    Task UpdateAsync(ReturnRequest returnRequest);
    Task AddMessageAsync(ReturnMessage message);
    Task<ReturnMessage?> GetMessageByIdAsync(Guid messageId);
    Task DeleteMessageAsync(ReturnMessage message);
    Task UpdateMessageAsync(ReturnMessage message);
    Task DeleteReturnAsync(ReturnRequest returnRequest);
}

