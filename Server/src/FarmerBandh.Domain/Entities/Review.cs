namespace FarmerBandh.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid BuyerId { get; set; }
    public Guid FarmerId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Body { get; set; }
    public bool IsVerifiedPurchase { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Order? Order { get; set; }
    public Product? Product { get; set; }
    public Buyer? Buyer { get; set; }
    public Farmer? Farmer { get; set; }
}
