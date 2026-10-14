using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminCouponService : IAdminCouponService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminCouponService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<(IEnumerable<AdminCouponDto> Items, int TotalCount)> GetCouponsAsync(AdminCouponQuery query)
    {
        return await _adminRepository.GetCouponsAsync(query);
    }

    public async Task<AdminCouponDto?> GetCouponByIdAsync(Guid id)
    {
        var c = await _adminRepository.GetCouponByIdAsync(id);
        if (c == null) return null;

        return new AdminCouponDto
        {
            Id = c.Id,
            Code = c.Code,
            Description = c.Description,
            Type = c.Type.ToString(),
            Value = c.Value,
            MinOrderValue = c.MinOrderValue,
            MaxDiscount = c.MaxDiscount,
            ValidFrom = c.ValidFrom,
            ValidTo = c.ValidTo,
            IsActive = c.IsActive,
            UsageLimit = c.UsageLimit,
            UsedCount = c.UsedCount,
            CreatedAt = c.CreatedAt
        };
    }

    public async Task<AdminCouponDto> CreateCouponAsync(CreateCouponRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var existing = await _adminRepository.GetCouponByCodeAsync(request.Code);
        if (existing != null)
        {
            throw new InvalidOperationException($"Coupon with code '{request.Code}' already exists.");
        }

        var couponType = request.Type.Equals("Flat", StringComparison.OrdinalIgnoreCase) || request.Type.Equals("Fixed", StringComparison.OrdinalIgnoreCase) ? CouponType.Flat : CouponType.Percent;

        var coupon = new Coupon
        {
            Id = Guid.NewGuid(),
            Code = request.Code.Trim().ToUpper(),
            Description = request.Description,
            Type = couponType,
            Value = request.Value,
            MinOrderValue = request.MinOrderValue,
            MaxDiscount = request.MaxDiscount,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
            IsActive = request.IsActive,
            UsageLimit = request.UsageLimit,
            UsedCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.AddCouponAsync(coupon);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "COUPON_CREATED",
            targetType: "Coupon",
            targetId: coupon.Id,
            summary: $"Created coupon {coupon.Code} ({coupon.Type}: {coupon.Value})",
            metadata: $"{{\"code\":\"{coupon.Code}\",\"type\":\"{coupon.Type}\",\"value\":{coupon.Value}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return new AdminCouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Description = coupon.Description,
            Type = coupon.Type.ToString(),
            Value = coupon.Value,
            MinOrderValue = coupon.MinOrderValue,
            MaxDiscount = coupon.MaxDiscount,
            ValidFrom = coupon.ValidFrom,
            ValidTo = coupon.ValidTo,
            IsActive = coupon.IsActive,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            CreatedAt = coupon.CreatedAt
        };
    }

    public async Task<bool> UpdateCouponAsync(Guid id, UpdateCouponRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var coupon = await _adminRepository.GetCouponByIdAsync(id);
        if (coupon == null) return false;

        var existingWithCode = await _adminRepository.GetCouponByCodeAsync(request.Code);
        if (existingWithCode != null && existingWithCode.Id != id)
        {
            throw new InvalidOperationException($"Another coupon with code '{request.Code}' already exists.");
        }

        var couponType = request.Type.Equals("Flat", StringComparison.OrdinalIgnoreCase) || request.Type.Equals("Fixed", StringComparison.OrdinalIgnoreCase) ? CouponType.Flat : CouponType.Percent;

        coupon.Code = request.Code.Trim().ToUpper();
        coupon.Description = request.Description;
        coupon.Type = couponType;
        coupon.Value = request.Value;
        coupon.MinOrderValue = request.MinOrderValue;
        coupon.MaxDiscount = request.MaxDiscount;
        coupon.ValidFrom = request.ValidFrom;
        coupon.ValidTo = request.ValidTo;
        coupon.IsActive = request.IsActive;
        coupon.UsageLimit = request.UsageLimit;

        await _adminRepository.UpdateCouponAsync(coupon);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "COUPON_UPDATED",
            targetType: "Coupon",
            targetId: coupon.Id,
            summary: $"Updated coupon {coupon.Code}",
            metadata: $"{{\"code\":\"{coupon.Code}\",\"value\":{coupon.Value},\"isActive\":{coupon.IsActive.ToString().ToLower()}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> DeleteCouponAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var coupon = await _adminRepository.GetCouponByIdAsync(id);
        if (coupon == null) return false;

        var code = coupon.Code;
        await _adminRepository.DeleteCouponAsync(coupon);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "COUPON_DELETED",
            targetType: "Coupon",
            targetId: id,
            summary: $"Deleted coupon {code}",
            metadata: $"{{\"deletedCode\":\"{code}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> ToggleCouponAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var coupon = await _adminRepository.GetCouponByIdAsync(id);
        if (coupon == null) return false;

        coupon.IsActive = !coupon.IsActive;
        await _adminRepository.UpdateCouponAsync(coupon);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "COUPON_TOGGLED",
            targetType: "Coupon",
            targetId: coupon.Id,
            summary: $"Toggled coupon {coupon.Code} active state to {coupon.IsActive}",
            metadata: $"{{\"code\":\"{coupon.Code}\",\"isActive\":{coupon.IsActive.ToString().ToLower()}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
