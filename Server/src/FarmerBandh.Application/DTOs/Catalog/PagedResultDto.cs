namespace FarmerBandh.Application.DTOs.Catalog;

public class PagedResultDto<T>
{
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public string? AppliedScope { get; set; }
    public string? FallbackMessage { get; set; }
    public string? TargetDistrict { get; set; }
    public string? TargetState { get; set; }
}
