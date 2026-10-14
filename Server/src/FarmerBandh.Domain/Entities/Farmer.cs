namespace FarmerBandh.Domain.Entities;

public class Farmer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public int Verified { get; set; } = 1;
    public decimal Rating { get; set; } = 5.0m;
    public string? Bio { get; set; }
    public DateTime MemberSince { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> SellerOrders { get; set; } = new List<Order>();

    // Phase 6 navigations
    public BankAccount? BankAccount { get; set; }
    public SellerSettings? SellerSettings { get; set; }
    public ICollection<Payout> Payouts { get; set; } = new List<Payout>();
    public ICollection<VerificationRequest> VerificationRequests { get; set; } = new List<VerificationRequest>();
}
