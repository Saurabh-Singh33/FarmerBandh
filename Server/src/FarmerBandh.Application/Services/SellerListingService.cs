using System.Text.RegularExpressions;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class SellerListingService : ISellerListingService
{
    private readonly ISellerOperationsRepository _sellerRepo;
    private readonly IProductRepository _productRepo;
    private readonly ICategoryRepository _categoryRepo;

    public SellerListingService(
        ISellerOperationsRepository sellerRepo,
        IProductRepository productRepo,
        ICategoryRepository categoryRepo)
    {
        _sellerRepo = sellerRepo;
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
    }

    public async Task<PagedResultDto<SellerListingItemDto>> GetListingsAsync(Guid userId, SellerListingQueryParams queryParams)
    {
        var farmer = await _sellerRepo.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        ProductStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(queryParams.Status) && Enum.TryParse<ProductStatus>(queryParams.Status, true, out var parsedStatus))
        {
            statusFilter = parsedStatus;
        }

        var (products, totalCount) = await _sellerRepo.GetSellerListingsAsync(
            farmer.Id,
            queryParams.Search,
            statusFilter,
            queryParams.Category,
            queryParams.Page,
            queryParams.PageSize);

        return new PagedResultDto<SellerListingItemDto>
        {
            Items = products.Select(p => MapToDto(p)),
            Total = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<SellerListingItemDto> GetListingByIdAsync(Guid userId, Guid listingId)
    {
        var farmer = await _sellerRepo.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException();

        var product = await _productRepo.GetByIdAsync(listingId);
        if (product == null) throw new KeyNotFoundException("Listing not found.");

        if (product.FarmerId != farmer.Id)
            throw new UnauthorizedAccessException("You are not authorized to view this listing.");

        return MapToDto(product);
    }

    public async Task<SellerListingItemDto> CreateListingAsync(Guid userId, CreateSellerListingRequest request)
    {
        var farmer = await _sellerRepo.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var category = await _categoryRepo.GetByIdAsync(request.CategoryId);
        if (category == null || !category.IsActive)
            throw new ArgumentException("Selected category does not exist or is inactive.");

        var grade = ParseGrade(request.Grade);
        var slug = await GenerateUniqueSlugAsync(request.Name);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Slug = slug,
            Grade = grade,
            PricePerQuintal = request.PricePerQuintal,
            AvailableQuantityQuintal = request.AvailableQuantityQuintal,
            MinOrderQuantityQuintal = request.MinOrderQuantityQuintal,
            BulkDiscountPercent = request.BulkDiscountPercent,
            BulkDiscountThresholdQuintal = request.BulkDiscountThresholdQuintal,
            HarvestDate = request.HarvestDate,
            Description = request.Description?.Trim(),
            ImageUrl = request.ImageUrl,
            State = farmer.State ?? string.Empty,
            District = farmer.District ?? string.Empty,
            City = farmer.Location ?? farmer.District,
            Status = request.SaveAsDraft ? ProductStatus.Draft : ProductStatus.Active,
            Verified = ProductVerificationStatus.Unverified,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _productRepo.CreateAsync(product);
        return MapToDto(created);
    }

    public async Task<SellerListingItemDto> UpdateListingAsync(Guid userId, Guid listingId, UpdateSellerListingRequest request)
    {
        var farmer = await _sellerRepo.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException();

        var product = await _productRepo.GetByIdAsync(listingId);
        if (product == null) throw new KeyNotFoundException("Listing not found.");

        if (product.FarmerId != farmer.Id)
            throw new UnauthorizedAccessException("You can only modify listings you own.");

        var category = await _categoryRepo.GetByIdAsync(request.CategoryId);
        if (category == null || !category.IsActive)
            throw new ArgumentException("Selected category does not exist or is inactive.");

        if (!string.Equals(product.Name, request.Name.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            product.Name = request.Name.Trim();
            product.Slug = await GenerateUniqueSlugAsync(product.Name, product.Id);
        }

        product.CategoryId = request.CategoryId;
        product.Grade = ParseGrade(request.Grade);
        product.PricePerQuintal = request.PricePerQuintal;
        product.AvailableQuantityQuintal = request.AvailableQuantityQuintal;
        product.MinOrderQuantityQuintal = request.MinOrderQuantityQuintal;
        product.BulkDiscountPercent = request.BulkDiscountPercent;
        product.BulkDiscountThresholdQuintal = request.BulkDiscountThresholdQuintal;
        product.HarvestDate = request.HarvestDate;
        product.Description = request.Description?.Trim();
        product.ImageUrl = request.ImageUrl ?? product.ImageUrl;
        product.UpdatedAt = DateTime.UtcNow;

        await _productRepo.UpdateAsync(product);
        return MapToDto(product);
    }

    public async Task<SellerListingItemDto> PublishListingAsync(Guid userId, Guid listingId)
    {
        return await ChangeStatusAsync(userId, listingId, ProductStatus.Active);
    }

    public async Task<SellerListingItemDto> UnpublishListingAsync(Guid userId, Guid listingId)
    {
        return await ChangeStatusAsync(userId, listingId, ProductStatus.Draft);
    }

    public async Task<SellerListingItemDto> MarkOutOfStockAsync(Guid userId, Guid listingId)
    {
        return await ChangeStatusAsync(userId, listingId, ProductStatus.OutOfStock);
    }

    public async Task<SellerListingItemDto> RestockListingAsync(Guid userId, Guid listingId)
    {
        return await ChangeStatusAsync(userId, listingId, ProductStatus.Active);
    }

    public async Task DeleteListingAsync(Guid userId, Guid listingId)
    {
        await ChangeStatusAsync(userId, listingId, ProductStatus.Removed);
    }

    private async Task<SellerListingItemDto> ChangeStatusAsync(Guid userId, Guid listingId, ProductStatus targetStatus)
    {
        var farmer = await _sellerRepo.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException();

        var product = await _productRepo.GetByIdAsync(listingId);
        if (product == null) throw new KeyNotFoundException("Listing not found.");

        if (product.FarmerId != farmer.Id)
            throw new UnauthorizedAccessException("You can only modify listings you own.");

        product.Status = targetStatus;
        product.UpdatedAt = DateTime.UtcNow;

        await _productRepo.UpdateAsync(product);
        return MapToDto(product);
    }

    private ProductGrade ParseGrade(string? grade)
    {
        if (Enum.TryParse<ProductGrade>(grade, true, out var parsed))
            return parsed;
        return ProductGrade.A;
    }

    private async Task<string> GenerateUniqueSlugAsync(string name, Guid? excludeId = null)
    {
        var baseSlug = Regex.Replace(name.ToLower().Trim(), @"[^a-z0-9\s-]", "");
        baseSlug = Regex.Replace(baseSlug, @"\s+", "-").Trim('-');

        if (string.IsNullOrWhiteSpace(baseSlug))
            baseSlug = "crop-produce";

        var slug = baseSlug;
        var counter = 1;
        while (await _productRepo.SlugExistsAsync(slug, excludeId))
        {
            slug = $"{baseSlug}-{counter++}";
        }
        return slug;
    }

    private static SellerListingItemDto MapToDto(Product p)
    {
        return new SellerListingItemDto
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            CategoryName = p.Category?.Name ?? "General",
            CategoryId = p.CategoryId,
            Grade = p.Grade.ToString(),
            PricePerQuintal = p.PricePerQuintal,
            AvailableQuantityQuintal = p.AvailableQuantityQuintal,
            MinOrderQuantityQuintal = p.MinOrderQuantityQuintal,
            BulkDiscountPercent = p.BulkDiscountPercent,
            BulkDiscountThresholdQuintal = p.BulkDiscountThresholdQuintal,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            HarvestDate = p.HarvestDate,
            VerifiedStatus = p.Verified.ToString(),
            ProductStatus = p.Status.ToString(),
            Rating = p.Rating,
            RatingCount = p.RatingCount,
            CreatedAt = p.CreatedAt
        };
    }
}
