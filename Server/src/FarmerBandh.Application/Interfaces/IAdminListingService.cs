using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminListingService
{
    Task<(IEnumerable<AdminListingListItemDto> Items, int TotalCount)> GetListingsAsync(AdminListingQuery query);
    Task<AdminListingDetailDto?> GetListingDetailAsync(Guid id);
    Task<bool> FlagListingAsync(Guid id, FlagListingRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> UnflagListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> RemoveListingAsync(Guid id, RemoveListingRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> RestoreListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> FeatureListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> UnfeatureListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<List<FeaturedListingItemDto>> GetFeaturedListingsAsync();
    Task<bool> ReorderFeaturedListingsAsync(ReorderFeaturedListingsRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
