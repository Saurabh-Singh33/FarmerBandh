namespace FarmerBandh.Application.DTOs.Catalog;

public class ProductSummaryDto
{
    public Guid Id { get; set; }
    public Guid FarmerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerLocation { get; set; } = string.Empty;
    public string Verified { get; set; } = string.Empty; // Unverified, Pending, Verified
    public decimal Rating { get; set; }
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal BulkDiscountPercent { get; set; }
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public string? ImageUrl { get; set; }
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
}
