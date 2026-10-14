namespace FarmerBandh.Application.DTOs.SavedFarmers;

public class SavedFarmerDto
{
    public Guid Id { get; set; }
    public Guid FarmerId { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public decimal Rating { get; set; }
    public bool Verified { get; set; }
    public int ActiveListingsCount { get; set; }
    public string? Note { get; set; }
    public string? Notes => Note;
    public DateTime SavedAt { get; set; }
    public DateTime? LastOrderAt { get; set; }
}

public class SaveFarmerRequestDto
{
    public Guid FarmerId { get; set; }
    public string? Note { get; set; }
    public string? Notes
    {
        get => Note;
        set => Note = value;
    }
}

public class SavedFarmerCheckDto
{
    public bool Saved { get; set; }
}
