using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Returns;

namespace FarmerBandh.Application.Interfaces;

public interface IReturnService
{
    Task<ReturnDetailDto> CreateReturnAsync(Guid userId, Guid orderId, CreateReturnRequest request);
    Task<PagedResultDto<ReturnSummaryDto>> GetBuyerReturnsAsync(Guid userId, string? status, int page, int pageSize);
    Task<ReturnDetailDto> GetBuyerReturnByIdAsync(Guid userId, Guid returnId);
    Task CancelReturnAsync(Guid userId, Guid returnId);
    Task DeleteReturnAsync(Guid userId, Guid returnId, bool deleteOrder = false);


    Task<PagedResultDto<ReturnSummaryDto>> GetSellerReturnsAsync(Guid userId, string? status, string? search, int page, int pageSize);
    Task<ReturnDetailDto> GetSellerReturnByIdAsync(Guid userId, Guid returnId);
    Task<ReturnDetailDto> ApproveSellerReturnAsync(Guid userId, Guid returnId, ApproveReturnRequest request);
    Task<ReturnDetailDto> RejectSellerReturnAsync(Guid userId, Guid returnId, RejectReturnRequest request);
    Task<ReturnMessageDto> AddMessageAsync(Guid userId, Guid returnId, PostReturnMessageRequest request);
    Task DeleteMessageAsync(Guid userId, Guid returnId, Guid messageId, bool forEveryone);
}
