namespace FarmerBandh.Application.DTOs.Catalog;

public class ProductDetailDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string Grade { get; set; } = "A";
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; }
    public decimal BulkDiscountPercent { get; set; }
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string Verified { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Rating { get; set; }
    public int RatingCount { get; set; }
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string? City { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsFeatured { get; set; }

    public FarmerSummaryDto Farmer { get; set; } = null!;
}
