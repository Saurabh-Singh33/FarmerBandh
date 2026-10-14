using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Refunds;

namespace FarmerBandh.Application.Interfaces;

public interface IRefundService
{
    Task<RefundDto> ProcessRefundAsync(Guid userId, Guid refundId);
    Task<PagedResultDto<RefundDto>> GetUserRefundsAsync(Guid userId, string? status, int page, int pageSize);
}
