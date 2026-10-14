namespace FarmerBandh.Domain.Entities;

public class FeaturedListing
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Guid FeaturedByUserId { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public DateTime StartsAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndsAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product Product { get; set; } = null!;
    public User FeaturedByUser { get; set; } = null!;
}
