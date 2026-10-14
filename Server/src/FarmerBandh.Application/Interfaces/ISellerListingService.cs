using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Seller;

namespace FarmerBandh.Application.Interfaces;

public interface ISellerListingService
{
    Task<PagedResultDto<SellerListingItemDto>> GetListingsAsync(Guid userId, SellerListingQueryParams queryParams);
    Task<SellerListingItemDto> GetListingByIdAsync(Guid userId, Guid listingId);
    Task<SellerListingItemDto> CreateListingAsync(Guid userId, CreateSellerListingRequest request);
    Task<SellerListingItemDto> UpdateListingAsync(Guid userId, Guid listingId, UpdateSellerListingRequest request);
    Task<SellerListingItemDto> PublishListingAsync(Guid userId, Guid listingId);
    Task<SellerListingItemDto> UnpublishListingAsync(Guid userId, Guid listingId);
    Task<SellerListingItemDto> MarkOutOfStockAsync(Guid userId, Guid listingId);
    Task<SellerListingItemDto> RestockListingAsync(Guid userId, Guid listingId);
    Task DeleteListingAsync(Guid userId, Guid listingId);
}
