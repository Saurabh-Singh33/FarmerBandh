namespace FarmerBandh.Application.DTOs.Auth;

public class AuthResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "buyer", "farmer", "admin"
    public string? State { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public object? Profile { get; set; }
}


