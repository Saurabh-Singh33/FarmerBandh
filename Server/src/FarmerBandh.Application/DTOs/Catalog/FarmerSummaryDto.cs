namespace FarmerBandh.Application.DTOs.Catalog;

public class FarmerSummaryDto
{
    public Guid Id { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public decimal Rating { get; set; }
    public string Verified { get; set; } = string.Empty;
    public DateTime MemberSince { get; set; }
}
