using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.DTOs.Seller;

public class CreateSellerListingRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Grade { get; set; } = "A";
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; } = 1;
    public decimal BulkDiscountPercent { get; set; } = 0;
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool SaveAsDraft { get; set; } = false;
}

public class UpdateSellerListingRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Grade { get; set; } = "A";
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; } = 1;
    public decimal BulkDiscountPercent { get; set; } = 0;
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}

public class SellerListingQueryParams
{
    public string? Search { get; set; }
    public string? Status { get; set; } // Draft | Active | OutOfStock | Removed
    public string? Category { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class SellerListingItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Grade { get; set; } = "A";
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; }
    public decimal BulkDiscountPercent { get; set; }
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string VerifiedStatus { get; set; } = "Unverified";
    public string ProductStatus { get; set; } = "Active";
    public decimal Rating { get; set; }
    public int RatingCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
