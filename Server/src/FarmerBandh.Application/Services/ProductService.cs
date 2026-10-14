using System.Text.RegularExpressions;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;

    public ProductService(IProductRepository productRepository, ICategoryRepository categoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
    {
        var categories = await _categoryRepository.GetActiveCategoriesAsync();
        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            DisplayOrder = c.DisplayOrder
        });
    }

    public async Task<PagedResultDto<ProductSummaryDto>> GetProductsAsync(ProductQueryParams queryParams, Guid? userId)
    {
        // Location scoping for logged-in buyer
        if (userId.HasValue && string.IsNullOrWhiteSpace(queryParams.State) && string.IsNullOrWhiteSpace(queryParams.District))
        {
            var buyer = await _productRepository.GetBuyerByUserIdAsync(userId.Value);
            if (buyer != null)
            {
                if (!string.IsNullOrWhiteSpace(buyer.PreferredState))
                {
                    queryParams.State = buyer.PreferredState;
                }
                if (!string.IsNullOrWhiteSpace(buyer.PreferredDistrict))
                {
                    queryParams.District = buyer.PreferredDistrict;
                }
            }
        }

        var (items, totalCount) = await _productRepository.GetProductsAsync(queryParams);
        var featuredIds = await _productRepository.GetFeaturedProductIdsAsync();

        var summaryList = items.Select(p =>
        {
            var dto = MapToSummaryDto(p);
            dto.IsFeatured = featuredIds.Contains(p.Id);
            return dto;
        }).ToList();

        // Pin featured products to top on default/newest sorting
        if (string.IsNullOrWhiteSpace(queryParams.Sort) || queryParams.Sort.Equals("newest", StringComparison.OrdinalIgnoreCase))
        {
            summaryList = summaryList.OrderByDescending(x => x.IsFeatured).ToList();
        }

        return new PagedResultDto<ProductSummaryDto>
        {
            Total = totalCount,
            Page = queryParams.Page < 1 ? 1 : queryParams.Page,
            PageSize = queryParams.PageSize < 1 ? 12 : Math.Min(queryParams.PageSize, 50),
            Items = summaryList
        };
    }

    public async Task<ProductDetailDto> GetProductByIdOrSlugAsync(string idOrSlug)
    {
        var product = await _productRepository.GetByIdOrSlugAsync(idOrSlug);
        if (product == null || product.Status == ProductStatus.Removed)
        {
            throw new KeyNotFoundException($"Product '{idOrSlug}' was not found.");
        }

        var detail = MapToDetailDto(product);
        detail.IsFeatured = await _productRepository.IsProductFeaturedAsync(product.Id);
        return detail;
    }

    public async Task<IEnumerable<ProductSummaryDto>> GetSimilarProductsAsync(string idOrSlug)
    {
        var product = await _productRepository.GetByIdOrSlugAsync(idOrSlug);
        if (product == null)
        {
            return Enumerable.Empty<ProductSummaryDto>();
        }

        var featuredIds = await _productRepository.GetFeaturedProductIdsAsync();
        var similar = await _productRepository.GetSimilarProductsAsync(product.Id, product.CategoryId, 8);
        return similar.Select(p =>
        {
            var dto = MapToSummaryDto(p);
            dto.IsFeatured = featuredIds.Contains(p.Id);
            return dto;
        });
    }

    public async Task<PagedResultDto<ProductSummaryDto>> GetSellerProductsAsync(Guid userId, ProductQueryParams queryParams)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Farmer profile not found for the logged-in user.");
        }

        var (items, totalCount) = await _productRepository.GetSellerProductsAsync(farmer.Id, queryParams);

        return new PagedResultDto<ProductSummaryDto>
        {
            Total = totalCount,
            Page = queryParams.Page < 1 ? 1 : queryParams.Page,
            PageSize = queryParams.PageSize < 1 ? 12 : Math.Min(queryParams.PageSize, 50),
            Items = items.Select(MapToSummaryDto)
        };
    }

    public async Task<ProductDetailDto> CreateProductAsync(Guid userId, CreateProductRequest request)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new InvalidOperationException("Only registered farmers can create products.");
        }

        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null || !category.IsActive)
        {
            throw new ArgumentException("Invalid or inactive category selected.");
        }

        string baseSlug = GenerateSlug(request.Name);
        string uniqueSlug = baseSlug;
        int counter = 1;
        while (await _productRepository.SlugExistsAsync(uniqueSlug))
        {
            uniqueSlug = $"{baseSlug}-{counter++}";
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            FarmerId = farmer.Id,
            CategoryId = category.Id,
            Name = request.Name.Trim(),
            Slug = uniqueSlug,
            Grade = (ProductGrade)request.Grade,
            PricePerQuintal = request.PricePerQuintal,
            AvailableQuantityQuintal = request.AvailableQuantityQuintal,
            MinOrderQuantityQuintal = request.MinOrderQuantityQuintal,
            BulkDiscountPercent = request.BulkDiscountPercent,
            BulkDiscountThresholdQuintal = request.BulkDiscountThresholdQuintal,
            HarvestDate = request.HarvestDate,
            Description = request.Description?.Trim(),
            Verified = farmer.Verified == 1 ? ProductVerificationStatus.Verified : ProductVerificationStatus.Unverified,
            Status = request.SaveAsDraft ? ProductStatus.Draft : ProductStatus.Active,
            Rating = 0.00m,
            RatingCount = 0,
            State = farmer.State ?? "Gujarat",
            District = farmer.District ?? "Ahmedabad",
            City = farmer.Location,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _productRepository.CreateAsync(product);
        var reloaded = await _productRepository.GetByIdAsync(created.Id);
        return MapToDetailDto(reloaded!);
    }

    public async Task<ProductDetailDto> UpdateProductAsync(Guid userId, Guid productId, UpdateProductRequest request)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new UnauthorizedAccessException("Farmer profile not found.");
        }

        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null || product.Status == ProductStatus.Removed)
        {
            throw new KeyNotFoundException("Product not found.");
        }

        if (product.FarmerId != farmer.Id)
        {
            throw new UnauthorizedAccessException("You can only modify your own products.");
        }

        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null || !category.IsActive)
        {
            throw new ArgumentException("Invalid or inactive category.");
        }

        // If name changed, regenerate unique slug
        if (!string.Equals(product.Name, request.Name.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            string baseSlug = GenerateSlug(request.Name);
            string uniqueSlug = baseSlug;
            int counter = 1;
            while (await _productRepository.SlugExistsAsync(uniqueSlug, product.Id))
            {
                uniqueSlug = $"{baseSlug}-{counter++}";
            }
            product.Slug = uniqueSlug;
        }

        product.Name = request.Name.Trim();
        product.CategoryId = category.Id;
        product.Grade = (ProductGrade)request.Grade;
        product.PricePerQuintal = request.PricePerQuintal;
        product.AvailableQuantityQuintal = request.AvailableQuantityQuintal;
        product.MinOrderQuantityQuintal = request.MinOrderQuantityQuintal;
        product.BulkDiscountPercent = request.BulkDiscountPercent;
        product.BulkDiscountThresholdQuintal = request.BulkDiscountThresholdQuintal;
        product.HarvestDate = request.HarvestDate;
        product.Description = request.Description?.Trim();
        product.Status = (ProductStatus)request.Status;

        await _productRepository.UpdateAsync(product);
        var reloaded = await _productRepository.GetByIdAsync(product.Id);
        return MapToDetailDto(reloaded!);
    }

    public async Task SoftDeleteProductAsync(Guid userId, Guid productId)
    {
        var farmer = await _productRepository.GetFarmerByUserIdAsync(userId);
        if (farmer == null)
        {
            throw new UnauthorizedAccessException("Farmer profile not found.");
        }

        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null || product.Status == ProductStatus.Removed)
        {
            return;
        }

        if (product.FarmerId != farmer.Id)
        {
            throw new UnauthorizedAccessException("You can only delete your own products.");
        }

        product.Status = ProductStatus.Removed;
        await _productRepository.UpdateAsync(product);
    }

    private static ProductSummaryDto MapToSummaryDto(Product p) => new()
    {
        Id = p.Id,
        FarmerId = p.FarmerId,
        Name = p.Name,
        Slug = p.Slug,
        Category = p.Category?.Name ?? string.Empty,
        FarmerName = p.Farmer?.FarmName ?? string.Empty,
        FarmerLocation = $"{p.District}, {p.State}",
        Verified = p.Verified.ToString(),
        Rating = p.Rating,
        PricePerQuintal = p.PricePerQuintal,
        AvailableQuantityQuintal = p.AvailableQuantityQuintal,
        BulkDiscountPercent = p.BulkDiscountPercent,
        BulkDiscountThresholdQuintal = p.BulkDiscountThresholdQuintal,
        ImageUrl = p.ImageUrl,
        State = p.State,
        District = p.District,
        Status = p.Status.ToString()
    };

    private static ProductDetailDto MapToDetailDto(Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        Name = p.Name,
        Slug = p.Slug,
        CategoryName = p.Category?.Name ?? string.Empty,
        CategorySlug = p.Category?.Slug ?? string.Empty,
        Grade = p.Grade.ToString(),
        PricePerQuintal = p.PricePerQuintal,
        AvailableQuantityQuintal = p.AvailableQuantityQuintal,
        MinOrderQuantityQuintal = p.MinOrderQuantityQuintal,
        BulkDiscountPercent = p.BulkDiscountPercent,
        BulkDiscountThresholdQuintal = p.BulkDiscountThresholdQuintal,
        HarvestDate = p.HarvestDate,
        Description = p.Description,
        ImageUrl = p.ImageUrl,
        Verified = p.Verified.ToString(),
        Status = p.Status.ToString(),
        Rating = p.Rating,
        RatingCount = p.RatingCount,
        State = p.State,
        District = p.District,
        City = p.City,
        CreatedAt = p.CreatedAt,
        Farmer = new FarmerSummaryDto
        {
            Id = p.Farmer?.Id ?? Guid.Empty,
            FarmName = p.Farmer?.FarmName ?? string.Empty,
            Location = p.Farmer?.Location ?? string.Empty,
            State = p.State,
            District = p.District,
            Rating = p.Farmer?.Rating ?? 5.0m,
            Verified = p.Farmer?.Verified == 1 ? "Verified" : "Unverified",
            MemberSince = p.Farmer?.MemberSince ?? DateTime.UtcNow
        }
    };

    private static string GenerateSlug(string name)
    {
        string str = name.ToLowerInvariant();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }
}
