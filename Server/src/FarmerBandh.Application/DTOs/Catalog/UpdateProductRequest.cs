namespace FarmerBandh.Application.DTOs.Catalog;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public int Grade { get; set; } = 1;
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; } = 1;
    public decimal BulkDiscountPercent { get; set; } = 0;
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int Status { get; set; } = 1; // 0=Draft, 1=Active, 2=OutOfStock
}
