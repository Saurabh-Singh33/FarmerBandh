namespace FarmerBandh.Application.DTOs.Buyer;

public class BuyerProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? DefaultAddressLine { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public string? Pincode { get; set; }
    public string? PreferredState { get; set; }
    public string? PreferredDistrict { get; set; }
    public DateTime MemberSince { get; set; }
    public string Role { get; set; } = "buyer";
    public int TotalOrders { get; set; }
    public string? ProfilePictureUrl { get; set; }
}

public class UpdateBuyerProfileRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? DefaultAddressLine { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public string? Pincode { get; set; }
    public string? PreferredState { get; set; }
    public string? PreferredDistrict { get; set; }
    public string? ProfilePictureUrl { get; set; }
}

public class ChangeBuyerPasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class DeleteBuyerAccountRequest
{
    public string Password { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

