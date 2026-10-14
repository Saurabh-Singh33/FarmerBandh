namespace FarmerBandh.Application.DTOs.Farmers;

public class FarmerPublicProfileDto
{
    public Guid Id { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public decimal Rating { get; set; }
    public int RatingCount { get; set; }
    public bool Verified { get; set; }
    public DateTime MemberSince { get; set; }
    public string? Bio { get; set; }
    public int ActiveListingsCount { get; set; }
    public int TotalOrdersCount { get; set; }
    public double ResponseTimeHours { get; set; }
}
