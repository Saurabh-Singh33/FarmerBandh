using FarmerBandh.Application.DTOs.Auth;

namespace FarmerBandh.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshAsync(RefreshRequest request);
    Task LogoutAsync(string refreshToken);
    Task<AuthResponse> GetCurrentUserAsync(Guid userId);
}
