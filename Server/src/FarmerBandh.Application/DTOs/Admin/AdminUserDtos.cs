namespace FarmerBandh.Application.DTOs.Admin;

public class AdminUserQuery
{
    public string? Search { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
    public string? VerificationStatus { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AdminUserListItemDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? State { get; set; }
    public string? District { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int OrderCount { get; set; }
    public int ListingCount { get; set; }
    public Guid? FarmerId { get; set; }
    public string? FarmName { get; set; }
    public int FarmerVerified { get; set; }
    public string FarmerVerifiedStatus { get; set; } = "Unverified";
}

public class AdminUserDetailDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? State { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int OrdersCount { get; set; }
    public int DisputesCount { get; set; }
    public int ReviewsWrittenCount { get; set; }
    public int ReviewsReceivedCount { get; set; }
    public List<AdminUserAddressDto> Addresses { get; set; } = new();
    public List<AdminUserListingDto> Listings { get; set; } = new();
    public AdminUserBankAccountDto? BankAccount { get; set; }
    public AdminUserFarmerDto? FarmerProfile { get; set; }
}

public class AdminUserFarmerDto
{
    public Guid FarmerId { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public int Verified { get; set; }
    public string VerificationStatus { get; set; } = string.Empty;
    public decimal Rating { get; set; }
    public string? Location { get; set; }
}

public class RejectSellerRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class AdminUserAddressDto
{
    public Guid Id { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class AdminUserListingDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public decimal PricePerQuintal { get; set; }
    public decimal AvailableQuantityQuintal { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AdminUserBankAccountDto
{
    public string AccountHolderName { get; set; } = string.Empty;
    public string MaskedAccountNumber { get; set; } = string.Empty;
    public string IfscCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string? UpiId { get; set; }
    public bool IsVerified { get; set; }
}

public class SuspendUserRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class PromoteUserRequest
{
    public string Role { get; set; } = "admin";
    public string CurrentAdminPassword { get; set; } = string.Empty;
}

public class DemoteUserRequest
{
    public string Role { get; set; } = string.Empty; // "buyer" | "farmer"
}

public class ResetPasswordResponse
{
    public string TemporaryPassword { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

