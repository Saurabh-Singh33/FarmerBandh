namespace FarmerBandh.Application.DTOs.Reviews;

public class CreateReviewItemDto
{
    public Guid ProductId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Body { get; set; }
}

public class CreateOrderReviewsRequest
{
    public List<CreateReviewItemDto> Items { get; set; } = new();
    public List<CreateReviewItemDto>? Reviews
    {
        get => Items;
        set { if (value != null) Items = value; }
    }
}


public class UpdateReviewRequest
{
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Body { get; set; }
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid BuyerId { get; set; }
    public string BuyerName { get; set; } = string.Empty; // First Name + Last Initial
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Body { get; set; }
    public bool IsVerifiedPurchase { get; set; }
    public DateTime CreatedAt { get; set; }
}
