namespace FarmerBandh.Application.DTOs.Auth;

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "buyer" or "farmer"
    public string? State { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public string? FarmName { get; set; }
}
