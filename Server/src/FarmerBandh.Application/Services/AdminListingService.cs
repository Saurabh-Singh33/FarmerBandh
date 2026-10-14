using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminListingService : IAdminListingService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminListingService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminListingListItemDto> Items, int TotalCount)> GetListingsAsync(AdminListingQuery query)
    {
        return await _adminRepository.GetListingsAsync(query);
    }

    public async Task<AdminListingDetailDto?> GetListingDetailAsync(Guid id)
    {
        return await _adminRepository.GetListingDetailAsync(id);
    }

    public async Task<bool> FlagListingAsync(Guid id, FlagListingRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var product = await _adminRepository.GetProductByIdAsync(id);
        if (product == null) return false;

        product.FlaggedReason = request.Reason;
        product.FlaggedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateProductAsync(product);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "LISTING_FLAGGED",
            targetType: "Listing",
            targetId: product.Id,
            summary: $"Flagged listing '{product.Name}'. Reason: {request.Reason}",
            metadata: $"{{\"productName\":\"{product.Name.Replace("\"", "\\\"")}\",\"reason\":\"{request.Reason.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> UnflagListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var product = await _adminRepository.GetProductByIdAsync(id);
        if (product == null) return false;

        var previousReason = product.FlaggedReason;
        product.FlaggedReason = null;
        product.FlaggedAt = null;
        product.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateProductAsync(product);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "LISTING_UNFLAGGED",
            targetType: "Listing",
            targetId: product.Id,
            summary: $"Unflagged listing '{product.Name}'",
            metadata: $"{{\"previousReason\":\"{previousReason?.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> RemoveListingAsync(Guid id, RemoveListingRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var product = await _adminRepository.GetProductByIdAsync(id);
        if (product == null) return false;

        product.Status = ProductStatus.Removed;
        product.FlaggedReason = request.Reason;
        product.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateProductAsync(product);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "LISTING_REMOVED",
            targetType: "Listing",
            targetId: product.Id,
            summary: $"Removed listing '{product.Name}' from marketplace. Reason: {request.Reason}",
            metadata: $"{{\"productName\":\"{product.Name.Replace("\"", "\\\"")}\",\"reason\":\"{request.Reason.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> RestoreListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var product = await _adminRepository.GetProductByIdAsync(id);
        if (product == null) return false;

        product.Status = product.AvailableQuantityQuintal > 0 ? ProductStatus.Active : ProductStatus.OutOfStock;
        product.FlaggedReason = null;
        product.FlaggedAt = null;
        product.UpdatedAt = DateTime.UtcNow;
        await _adminRepository.UpdateProductAsync(product);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "LISTING_RESTORED",
            targetType: "Listing",
            targetId: product.Id,
            summary: $"Restored listing '{product.Name}' to {product.Status}",
            metadata: $"{{\"newStatus\":\"{product.Status}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> FeatureListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var product = await _adminRepository.GetProductByIdAsync(id);
        if (product == null) return false;

        var existing = await _adminRepository.GetFeaturedListingByProductIdAsync(id);
        if (existing == null)
        {
            var featured = new FeaturedListing
            {
                Id = Guid.NewGuid(),
                ProductId = id,
                FeaturedByUserId = currentAdminId,
                DisplayOrder = 0,
                StartsAt = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await _adminRepository.AddFeaturedListingAsync(featured);
        }
        else
        {
            existing.IsActive = true;
        }

        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "LISTING_FEATURED",
            targetType: "Listing",
            targetId: product.Id,
            summary: $"Added listing '{product.Name}' to featured items",
            metadata: $"{{\"productName\":\"{product.Name.Replace("\"", "\\\"")}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> UnfeatureListingAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var product = await _adminRepository.GetProductByIdAsync(id);
        var existing = await _adminRepository.GetFeaturedListingByProductIdAsync(id);
        if (existing == null) return false;

        await _adminRepository.RemoveFeaturedListingAsync(existing);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "LISTING_UNFEATURED",
            targetType: "Listing",
            targetId: id,
            summary: $"Removed listing '{product?.Name ?? "Item"}' from featured items",
            metadata: $"{{\"productId\":\"{id}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<List<FeaturedListingItemDto>> GetFeaturedListingsAsync()
    {
        return await _adminRepository.GetFeaturedListingsAsync();
    }

    public async Task<bool> ReorderFeaturedListingsAsync(ReorderFeaturedListingsRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        await _adminRepository.UpdateFeaturedListingsOrderAsync(request.Items);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "FEATURED_LISTINGS_REORDERED",
            targetType: "Listing",
            targetId: null,
            summary: $"Reordered {request.Items.Count} featured listings",
            metadata: $"{{\"reorderedCount\":{request.Items.Count}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
