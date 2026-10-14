using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public Guid FarmerId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public ProductGrade Grade { get; set; } = ProductGrade.A;
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; } = 1;
    public decimal BulkDiscountPercent { get; set; } = 0;
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public ProductVerificationStatus Verified { get; set; } = ProductVerificationStatus.Unverified;
    public ProductStatus Status { get; set; } = ProductStatus.Draft;
    public decimal Rating { get; set; } = 0;
    public int RatingCount { get; set; } = 0;
    public string? FlaggedReason { get; set; }
    public DateTime? FlaggedAt { get; set; }

    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string? City { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Farmer Farmer { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
