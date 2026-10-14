using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Negotiations;

namespace FarmerBandh.Application.Interfaces;

public interface INegotiationService
{
    // Buyer operations
    Task<NegotiationDetailDto> StartNegotiationAsync(Guid buyerUserId, CreateNegotiationRequestDto request);
    Task<IEnumerable<NegotiationSummaryDto>> GetBuyerNegotiationsAsync(Guid buyerUserId, string? status = null, string? search = null);
    Task<NegotiationDetailDto> GetBuyerNegotiationDetailAsync(Guid buyerUserId, Guid negotiationId);
    Task<NegotiationDetailDto> BuyerSendMessageAsync(Guid buyerUserId, Guid negotiationId, SendNegotiationMessageRequestDto request);
    Task<NegotiationDetailDto> BuyerAcceptAsync(Guid buyerUserId, Guid negotiationId, AcceptNegotiationRequestDto? request = null);
    Task<NegotiationDetailDto> BuyerRejectAsync(Guid buyerUserId, Guid negotiationId, RejectNegotiationRequestDto? request = null);
    Task<NegotiationDetailDto> BuyerWithdrawAsync(Guid buyerUserId, Guid negotiationId);

    // Seller operations
    Task<IEnumerable<NegotiationSummaryDto>> GetSellerNegotiationsAsync(Guid farmerUserId, string? status = null, string? search = null);
    Task<NegotiationDetailDto> GetSellerNegotiationDetailAsync(Guid farmerUserId, Guid negotiationId);
    Task<NegotiationDetailDto> SellerSendMessageAsync(Guid farmerUserId, Guid negotiationId, SendNegotiationMessageRequestDto request);
    Task<NegotiationDetailDto> SellerAcceptAsync(Guid farmerUserId, Guid negotiationId, AcceptNegotiationRequestDto? request = null);
    Task<NegotiationDetailDto> SellerRejectAsync(Guid farmerUserId, Guid negotiationId, RejectNegotiationRequestDto? request = null);

    // Shared
    Task<UnreadCountDto> GetUnreadCountAsync(Guid userId);
    Task ExpireStaleNegotiationsAsync();
}
