using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Domain.Entities;

public class SellerSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FarmerId { get; set; }
    public PayoutCadence PayoutCadence { get; set; } = PayoutCadence.OnRequest;
    public decimal MinimumPayoutAmount { get; set; } = 500m;
    public bool NotifyOnNewOrder { get; set; } = true;
    public bool NotifyOnNewNegotiation { get; set; } = true;
    public bool NotifyOnNewReturn { get; set; } = true;
    public bool NotifyOnNewReview { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Farmer Farmer { get; set; } = null!;
}
