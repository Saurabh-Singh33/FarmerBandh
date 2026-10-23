using FarmerBandh.Application.DTOs.Buyer;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class BuyerProfileService : IBuyerProfileService
{
    private readonly IUserRepository _userRepository;
    private readonly IOrderRepository _orderRepository;

    public BuyerProfileService(IUserRepository userRepository, IOrderRepository orderRepository)
    {
        _userRepository = userRepository;
        _orderRepository = orderRepository;
    }

    public async Task<BuyerProfileDto> GetProfileAsync(Guid userId)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(userId);
        var user = buyer?.User ?? await _userRepository.GetByIdAsync(userId);
        if (user == null) throw new UnauthorizedAccessException("User profile not found.");

        if (buyer == null)
        {
            buyer = new Buyer
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                City = user.City,
                State = user.State,
                PreferredState = user.State,
                PreferredDistrict = user.District,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.AddBuyerAsync(buyer);
            await _userRepository.SaveChangesAsync();
            buyer.User = user;
        }

        int totalOrders = 0;
        try
        {
            var (_, count) = await _orderRepository.GetBuyerOrdersAsync(buyer.Id, null, null, 1, 1);
            totalOrders = count;
        }
        catch
        {
            // Gracefully ignore order count errors
        }

        return new BuyerProfileDto
        {
            Id = buyer.Id,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = buyer.Phone,
            DefaultAddressLine = buyer.DefaultAddressLine,
            City = buyer.City ?? user.City,
            State = buyer.State ?? user.State,
            District = user.District,
            Pincode = buyer.Pincode,
            PreferredState = buyer.PreferredState ?? user.State,
            PreferredDistrict = buyer.PreferredDistrict ?? user.District,
            MemberSince = user.CreatedAt,
            Role = user.Role.ToString().ToLower(),
            TotalOrders = totalOrders,
            ProfilePictureUrl = user.ProfilePictureUrl
        };
    }

    public async Task<BuyerProfileDto> UpdateProfileAsync(Guid userId, UpdateBuyerProfileRequest request)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(userId);
        var user = buyer?.User ?? await _userRepository.GetByIdAsync(userId);
        if (user == null) throw new UnauthorizedAccessException("User profile not found.");

        if (buyer == null)
        {
            buyer = new Buyer
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.AddBuyerAsync(buyer);
            buyer.User = user;
        }

        bool userChanged = false;

        // Profile Picture
        if (request.ProfilePictureUrl != null && !string.Equals(user.ProfilePictureUrl, request.ProfilePictureUrl.Trim()))
        {
            user.ProfilePictureUrl = string.IsNullOrWhiteSpace(request.ProfilePictureUrl) ? null : request.ProfilePictureUrl.Trim();
            userChanged = true;
        }

        // 1. Email check & update
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var trimmedEmail = request.Email.Trim().ToLowerInvariant();
            if (!string.Equals(user.Email, trimmedEmail, StringComparison.OrdinalIgnoreCase))
            {
                var existing = await _userRepository.GetByEmailAsync(trimmedEmail);
                if (existing != null && existing.Id != user.Id)
                {
                    throw new ArgumentException("The specified email address is already in use by another account.");
                }
                user.Email = trimmedEmail;
                userChanged = true;
            }
        }

        // 2. Full Name
        if (!string.IsNullOrWhiteSpace(request.FullName) && !string.Equals(user.FullName, request.FullName.Trim()))
        {
            user.FullName = request.FullName.Trim();
            userChanged = true;
        }

        // 3. User location fields
        if (request.State != null && !string.Equals(user.State, request.State.Trim()))
        {
            user.State = request.State.Trim();
            userChanged = true;
        }
        if (request.District != null && !string.Equals(user.District, request.District.Trim()))
        {
            user.District = request.District.Trim();
            userChanged = true;
        }
        if (request.City != null && !string.Equals(user.City, request.City.Trim()))
        {
            user.City = request.City.Trim();
            userChanged = true;
        }

        if (userChanged)
        {
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
        }

        // 4. Buyer specifics
        buyer.Phone = request.Phone?.Trim();
        buyer.DefaultAddressLine = request.DefaultAddressLine?.Trim();
        buyer.City = request.City?.Trim() ?? user.City;
        buyer.State = request.State?.Trim() ?? user.State;
        buyer.Pincode = request.Pincode?.Trim();
        buyer.PreferredState = request.PreferredState?.Trim() ?? buyer.State;
        buyer.PreferredDistrict = request.PreferredDistrict?.Trim() ?? user.District;

        await _userRepository.SaveChangesAsync();
        return await GetProfileAsync(userId);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangeBuyerPasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) throw new UnauthorizedAccessException("User not found.");

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            throw new ArgumentException("Current password is required.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            throw new ArgumentException("New password must be at least 6 characters.");
        }

        bool isCurrentValid = false;
        try
        {
            isCurrentValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
        }
        catch
        {
            isCurrentValid = user.PasswordHash == request.CurrentPassword;
        }

        if (!isCurrentValid)
        {
            throw new ArgumentException("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
    }

    public async Task DeleteAccountAsync(Guid userId, DeleteBuyerAccountRequest request)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(userId);
        var user = buyer?.User ?? await _userRepository.GetByIdAsync(userId);
        if (user == null) throw new UnauthorizedAccessException("User profile not found.");

        // 1. Password verification
        if (string.IsNullOrWhiteSpace(request?.Password))
        {
            throw new ArgumentException("Password is required to confirm account deletion.");
        }

        bool isCurrentValid = false;
        try
        {
            isCurrentValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            isCurrentValid = user.PasswordHash == request.Password;
        }

        if (!isCurrentValid)
        {
            throw new ArgumentException("Current password is incorrect. Please verify your password to proceed with account deletion.");
        }

        // 2. Check for active unfulfilled orders
        if (buyer != null)
        {
            var activeOrdersCount = await _orderRepository.GetActiveBuyerOrdersCountAsync(buyer.Id);
            if (activeOrdersCount > 0)
            {
                throw new InvalidOperationException($"Cannot delete account. You have {activeOrdersCount} active order(s) currently being processed or delivered. Please wait until they are completed or cancelled.");
            }
        }

        // 3. Revoke active refresh tokens
        if (user.RefreshTokens != null)
        {
            foreach (var rt in user.RefreshTokens.Where(rt => rt.IsActive))
            {
                rt.RevokedAt = DateTime.UtcNow;
            }
        }

        // 4. Soft-delete and anonymize user record
        user.Status = UserStatus.Suspended;
        user.Email = $"deleted_{Guid.NewGuid():N}_{user.Email}";
        user.PasswordHash = string.Empty;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepository.Update(user);

        // 5. Clear buyer specific details if buyer exists
        if (buyer != null)
        {
            buyer.Phone = null;
            buyer.DefaultAddressLine = null;
            buyer.Pincode = null;
        }

        await _userRepository.SaveChangesAsync();
    }
}
