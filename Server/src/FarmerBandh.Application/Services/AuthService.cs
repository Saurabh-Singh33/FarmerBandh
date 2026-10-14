using FarmerBandh.Application.DTOs.Auth;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLower();
        var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        var roleStr = request.Role.Trim().ToLower();
        if (roleStr == "admin")
        {
            throw new InvalidOperationException("Public admin registration is prohibited.");
        }

        UserRole role;
        if (roleStr == "farmer")
        {
            role = UserRole.Farmer;
        }
        else if (roleStr == "buyer")
        {
            role = UserRole.Buyer;
        }
        else
        {
            throw new ArgumentException("Invalid role specified. Allowed roles are 'buyer' and 'farmer'.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            Status = UserStatus.Active,
            State = request.State,
            District = request.District,
            City = request.City,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            NotificationPreference = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                OrderUpdates = true,
                NegotiationUpdates = true,
                ReturnDisputeUpdates = true,
                PayoutUpdates = true,
                VerificationUpdates = true,
                ReviewUpdates = true,
                SystemAnnouncements = true,
                UpdatedAt = DateTime.UtcNow
            }
        };

        await _userRepository.AddAsync(user);

        if (role == UserRole.Farmer)
        {
            var farmer = new Farmer
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                FarmName = !string.IsNullOrWhiteSpace(request.FarmName) ? request.FarmName.Trim() : $"{request.FullName}'s Farm",
                State = request.State,
                District = request.District,
                Location = !string.IsNullOrWhiteSpace(request.City) ? request.City : request.District,
                Verified = 1,
                Rating = 5.0m,
                MemberSince = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.AddFarmerAsync(farmer);
            user.Farmer = farmer;
        }
        else if (role == UserRole.Buyer)
        {
            var buyer = new Buyer
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                City = request.City,
                State = request.State,
                PreferredState = request.State,
                PreferredDistrict = request.District,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.AddBuyerAsync(buyer);
            user.Buyer = buyer;
        }

        await _userRepository.SaveChangesAsync();

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);

        await _userRepository.AddRefreshTokenAsync(refreshToken);
        await _userRepository.SaveChangesAsync();

        return MapToAuthResponse(user, accessToken, refreshToken.Token, refreshToken.ExpiresAt);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLower();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (user.Status != UserStatus.Active)
        {
            throw new UnauthorizedAccessException("Account is suspended or inactive.");
        }

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepository.Update(user);

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);

        await _userRepository.AddRefreshTokenAsync(refreshToken);
        await _userRepository.SaveChangesAsync();

        return MapToAuthResponse(user, accessToken, refreshToken.Token, refreshToken.ExpiresAt);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new UnauthorizedAccessException("Refresh token is required.");
        }

        var existingToken = await _userRepository.GetRefreshTokenAsync(request.RefreshToken);

        if (existingToken == null || !existingToken.IsActive || existingToken.User == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var user = existingToken.User;
        if (user.Status != UserStatus.Active)
        {
            throw new UnauthorizedAccessException("Account is suspended or inactive.");
        }

        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken(user.Id);

        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.ReplacedByToken = newRefreshToken.Token;
        _userRepository.UpdateRefreshToken(existingToken);

        await _userRepository.AddRefreshTokenAsync(newRefreshToken);
        await _userRepository.SaveChangesAsync();

        return MapToAuthResponse(user, newAccessToken, newRefreshToken.Token, newRefreshToken.ExpiresAt);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var token = await _userRepository.GetRefreshTokenAsync(refreshToken);
        if (token != null && token.IsActive)
        {
            token.RevokedAt = DateTime.UtcNow;
            _userRepository.UpdateRefreshToken(token);
            await _userRepository.SaveChangesAsync();
        }
    }

    public async Task<AuthResponse> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        return MapToAuthResponse(user, string.Empty, string.Empty, DateTime.MinValue);
    }

    private static AuthResponse MapToAuthResponse(User user, string accessToken, string refreshToken, DateTime expiresAt)
    {
        object? profile = null;
        if (user.Role == UserRole.Farmer && user.Farmer != null)
        {
            profile = new
            {
                user.Farmer.Id,
                user.Farmer.FarmName,
                user.Farmer.Location,
                user.Farmer.State,
                user.Farmer.District,
                user.Farmer.Verified,
                user.Farmer.Rating,
                user.Farmer.MemberSince
            };
        }
        else if (user.Role == UserRole.Buyer && user.Buyer != null)
        {
            profile = new
            {
                user.Buyer.Id,
                user.Buyer.Phone,
                user.Buyer.DefaultAddressLine,
                user.Buyer.City,
                user.Buyer.State,
                user.Buyer.Pincode,
                user.Buyer.PreferredState,
                user.Buyer.PreferredDistrict
            };
        }

        return new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString().ToLower(),
            State = user.State,
            District = user.District,
            City = user.City,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            Profile = profile
        };
    }
}
