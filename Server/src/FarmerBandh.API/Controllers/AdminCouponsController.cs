using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/coupons")]
public class AdminCouponsController : AdminBaseController
{
    private readonly IAdminCouponService _couponService;

    public AdminCouponsController(IAdminCouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<ActionResult> GetCoupons([FromQuery] AdminCouponQuery query)
    {
        var (items, total) = await _couponService.GetCouponsAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminCouponDto>> GetCouponById(Guid id)
    {
        var coupon = await _couponService.GetCouponByIdAsync(id);
        if (coupon == null) return NotFound(new { message = $"Coupon {id} not found." });
        return Ok(coupon);
    }

    [HttpPost]
    public async Task<ActionResult<AdminCouponDto>> CreateCoupon([FromBody] CreateCouponRequest request)
    {
        try
        {
            var coupon = await _couponService.CreateCouponAsync(request, GetAdminUserId(), HttpContext);
            return CreatedAtAction(nameof(GetCouponById), new { id = coupon.Id }, coupon);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateCoupon(Guid id, [FromBody] UpdateCouponRequest request)
    {
        try
        {
            var success = await _couponService.UpdateCouponAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to update coupon." });
            return Ok(new { message = "Coupon updated successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteCoupon(Guid id)
    {
        var success = await _couponService.DeleteCouponAsync(id, GetAdminUserId(), HttpContext);
        if (!success) return NotFound(new { message = $"Coupon {id} not found." });
        return NoContent();
    }

    [HttpPost("{id:guid}/toggle")]
    public async Task<ActionResult> ToggleStatus(Guid id)
    {
        var success = await _couponService.ToggleCouponAsync(id, GetAdminUserId(), HttpContext);
        if (!success) return NotFound(new { message = $"Coupon {id} not found." });
        return Ok(new { message = "Coupon status toggled successfully." });
    }
}
