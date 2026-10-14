namespace FarmerBandh.Domain.Entities;

public class SavedFarmer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuyerId { get; set; }
    public Guid FarmerId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    public string? Note { get; set; }

    // Navigation properties
    public Buyer? Buyer { get; set; }
    public Farmer? Farmer { get; set; }
}
