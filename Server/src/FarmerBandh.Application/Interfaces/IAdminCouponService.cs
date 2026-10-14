using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminCouponService
{
    Task<(IEnumerable<AdminCouponDto> Items, int TotalCount)> GetCouponsAsync(AdminCouponQuery query);
    Task<AdminCouponDto?> GetCouponByIdAsync(Guid id);
    Task<AdminCouponDto> CreateCouponAsync(CreateCouponRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> UpdateCouponAsync(Guid id, UpdateCouponRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> DeleteCouponAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> ToggleCouponAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
}
