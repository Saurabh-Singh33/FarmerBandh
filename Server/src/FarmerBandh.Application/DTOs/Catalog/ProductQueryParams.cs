namespace FarmerBandh.Application.DTOs.Catalog;

public class ProductQueryParams
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public decimal? MinRating { get; set; }
    public bool? VerifiedOnly { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public string? Status { get; set; }
    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    public bool? DisableFallback { get; set; }
    public bool? AllIndia { get; set; }
}
