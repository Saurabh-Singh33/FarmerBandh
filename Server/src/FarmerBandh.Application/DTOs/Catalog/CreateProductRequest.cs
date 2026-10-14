namespace FarmerBandh.Application.DTOs.Catalog;

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public int Grade { get; set; } = 1; // 1=A, 2=B, 3=C
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; } = 1;
    public decimal BulkDiscountPercent { get; set; } = 0;
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string? Description { get; set; }
    public bool SaveAsDraft { get; set; } = false;
}
