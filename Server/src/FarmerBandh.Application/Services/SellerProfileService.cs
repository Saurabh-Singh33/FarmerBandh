using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class SellerProfileService : ISellerProfileService
{
    private readonly ISellerOperationsRepository _repository;
    private readonly IUserRepository _userRepository;

    public SellerProfileService(
        ISellerOperationsRepository repository,
        IUserRepository userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<SellerProfileDto> GetProfileAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var user = farmer.User ?? await _userRepository.GetByIdAsync(userId);
        var initials = GetInitials(user?.FullName);

        string verified = farmer.Verified switch
        {
            2 => "Verified",
            1 => "Pending",
            _ => "Unverified"
        };

        return new SellerProfileDto
        {
            Name = user?.FullName ?? string.Empty,
            Email = user?.Email ?? string.Empty,
            Phone = !string.IsNullOrWhiteSpace(farmer.Phone) ? farmer.Phone : "+919508461241",
            FarmName = farmer.FarmName,
            Location = farmer.Location,
            State = farmer.State,
            District = farmer.District,
            Bio = farmer.Bio,
            MemberSince = farmer.MemberSince,
            Rating = farmer.Rating,
            Verified = verified,
            AvatarInitials = initials
        };
    }

    public async Task<SellerProfileDto> UpdateProfileAsync(Guid userId, UpdateSellerProfileRequest request)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var user = farmer.User ?? await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            bool userChanged = false;

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

            if (!string.IsNullOrWhiteSpace(request.FullName) && !string.Equals(user.FullName, request.FullName.Trim()))
            {
                user.FullName = request.FullName.Trim();
                userChanged = true;
            }

            if (userChanged)
            {
                user.UpdatedAt = DateTime.UtcNow;
                _userRepository.Update(user);
                await _userRepository.SaveChangesAsync();
            }
        }

        farmer.FarmName = request.FarmName.Trim();
        farmer.Location = request.Location?.Trim();
        farmer.State = request.State?.Trim();
        farmer.District = request.District?.Trim();
        farmer.Bio = request.Bio?.Trim();
        farmer.Phone = !string.IsNullOrWhiteSpace(request.Phone) ? request.Phone.Trim() : "+919508461241";

        await _repository.SaveChangesAsync();
        return await GetProfileAsync(userId);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangeSellerPasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) throw new UnauthorizedAccessException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ArgumentException("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
    }

    public async Task<SellerSettingsDto> GetSettingsAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var settings = await _repository.GetSellerSettingsAsync(farmer.Id);
        if (settings == null)
        {
            settings = new SellerSettings
            {
                Id = Guid.NewGuid(),
                FarmerId = farmer.Id,
                PayoutCadence = PayoutCadence.OnRequest,
                MinimumPayoutAmount = 500m,
                NotifyOnNewOrder = true,
                NotifyOnNewNegotiation = true,
                NotifyOnNewReturn = true,
                NotifyOnNewReview = true,
                UpdatedAt = DateTime.UtcNow
            };
            await _repository.AddSellerSettingsAsync(settings);
            await _repository.SaveChangesAsync();
        }

        return MapSettingsToDto(settings);
    }

    public async Task<SellerSettingsDto> UpdateSettingsAsync(Guid userId, UpdateSellerSettingsRequest request)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var settings = await _repository.GetSellerSettingsAsync(farmer.Id);
        var now = DateTime.UtcNow;

        var cadence = Enum.TryParse<PayoutCadence>(request.PayoutCadence, true, out var parsed)
            ? parsed
            : PayoutCadence.OnRequest;

        if (settings == null)
        {
            settings = new SellerSettings
            {
                Id = Guid.NewGuid(),
                FarmerId = farmer.Id,
                PayoutCadence = cadence,
                MinimumPayoutAmount = request.MinimumPayoutAmount,
                NotifyOnNewOrder = request.NotifyOnNewOrder,
                NotifyOnNewNegotiation = request.NotifyOnNewNegotiation,
                NotifyOnNewReturn = request.NotifyOnNewReturn,
                NotifyOnNewReview = request.NotifyOnNewReview,
                UpdatedAt = now
            };
            await _repository.AddSellerSettingsAsync(settings);
        }
        else
        {
            settings.PayoutCadence = cadence;
            settings.MinimumPayoutAmount = request.MinimumPayoutAmount;
            settings.NotifyOnNewOrder = request.NotifyOnNewOrder;
            settings.NotifyOnNewNegotiation = request.NotifyOnNewNegotiation;
            settings.NotifyOnNewReturn = request.NotifyOnNewReturn;
            settings.NotifyOnNewReview = request.NotifyOnNewReview;
            settings.UpdatedAt = now;
            await _repository.UpdateSellerSettingsAsync(settings);
        }

        await _repository.SaveChangesAsync();
        return MapSettingsToDto(settings);
    }

    private static SellerSettingsDto MapSettingsToDto(SellerSettings s)
    {
        return new SellerSettingsDto
        {
            PayoutCadence = s.PayoutCadence.ToString(),
            MinimumPayoutAmount = s.MinimumPayoutAmount,
            NotifyOnNewOrder = s.NotifyOnNewOrder,
            NotifyOnNewNegotiation = s.NotifyOnNewNegotiation,
            NotifyOnNewReturn = s.NotifyOnNewReturn,
            NotifyOnNewReview = s.NotifyOnNewReview,
            UpdatedAt = s.UpdatedAt
        };
    }

    private static string GetInitials(string? name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "F";
        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length >= 2)
            return $"{parts[0][0]}{parts[1][0]}".ToUpperInvariant();
        return name[..1].ToUpperInvariant();
    }
}
