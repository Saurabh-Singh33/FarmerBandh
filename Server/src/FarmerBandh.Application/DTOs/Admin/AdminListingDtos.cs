namespace FarmerBandh.Application.DTOs.Admin;

public class AdminListingQuery
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Category { get; set; }
    public bool? Verified { get; set; }
    public bool? Flagged { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AdminListingListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlaggedReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminListingDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string Grade { get; set; } = string.Empty;
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public decimal MinOrderQuantityQuintal { get; set; }
    public decimal BulkDiscountPercent { get; set; }
    public decimal? BulkDiscountThresholdQuintal { get; set; }
    public DateTime? HarvestDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string? City { get; set; }
    public decimal Rating { get; set; }
    public int RatingCount { get; set; }
    public bool IsVerified { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlaggedReason { get; set; }
    public DateTime? FlaggedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Farmer details
    public Guid FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmName { get; set; } = string.Empty;
    public string FarmerEmail { get; set; } = string.Empty;
    public string FarmerPhone { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
}

public class FlagListingRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class RemoveListingRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class FeaturedListingItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal PricePerQuintal { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReorderFeaturedListingsRequest
{
    public List<FeaturedOrderItem> Items { get; set; } = new();
}

public class FeaturedOrderItem
{
    public Guid ProductId { get; set; }
    public int DisplayOrder { get; set; }
}
