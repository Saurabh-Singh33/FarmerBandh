namespace FarmerBandh.Application.DTOs.Seller;

public class SellerProfileDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public string? Bio { get; set; }
    public DateTime MemberSince { get; set; }
    public decimal Rating { get; set; }
    public string Verified { get; set; } = "Unverified";
    public string AvatarInitials { get; set; } = "F";
}

public class UpdateSellerProfileRequest
{
    public string FarmName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Location { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public string? Bio { get; set; }
    public string? Phone { get; set; }
}

public class ChangeSellerPasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class SellerSettingsDto
{
    public string PayoutCadence { get; set; } = "OnRequest"; // OnRequest | Weekly | Monthly
    public decimal MinimumPayoutAmount { get; set; } = 500m;
    public bool NotifyOnNewOrder { get; set; } = true;
    public bool NotifyOnNewNegotiation { get; set; } = true;
    public bool NotifyOnNewReturn { get; set; } = true;
    public bool NotifyOnNewReview { get; set; } = true;
    public DateTime UpdatedAt { get; set; }
}

public class UpdateSellerSettingsRequest
{
    public string PayoutCadence { get; set; } = "OnRequest";
    public decimal MinimumPayoutAmount { get; set; } = 500m;
    public bool NotifyOnNewOrder { get; set; } = true;
    public bool NotifyOnNewNegotiation { get; set; } = true;
    public bool NotifyOnNewReturn { get; set; } = true;
    public bool NotifyOnNewReview { get; set; } = true;
}

public class DeleteSellerAccountRequest
{
    public string Password { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

