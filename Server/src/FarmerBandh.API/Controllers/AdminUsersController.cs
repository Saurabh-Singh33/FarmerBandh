using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/users")]
public class AdminUsersController : AdminBaseController
{
    private readonly IAdminUserService _userService;

    public AdminUsersController(IAdminUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult> GetUsers([FromQuery] AdminUserQuery query)
    {
        var (items, total) = await _userService.GetUsersAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminUserDetailDto>> GetUserDetail(Guid id)
    {
        var user = await _userService.GetUserDetailAsync(id);
        if (user == null) return NotFound(new { message = $"User {id} not found." });
        return Ok(user);
    }

    [HttpPost("{id:guid}/suspend")]
    public async Task<ActionResult> SuspendUser(Guid id, [FromBody] SuspendUserRequest request)
    {
        try
        {
            var success = await _userService.SuspendUserAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to suspend user." });
            return Ok(new { message = "User suspended successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reactivate")]
    public async Task<ActionResult> ReactivateUser(Guid id)
    {
        try
        {
            var success = await _userService.ReactivateUserAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to reactivate user." });
            return Ok(new { message = "User reactivated successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult<ResetPasswordResponse>> ResetPassword(Guid id)
    {
        try
        {
            var res = await _userService.ResetPasswordAsync(id, GetAdminUserId(), HttpContext);
            if (res == null) return BadRequest(new { message = "Failed to reset password." });
            return Ok(res);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/promote")]
    public async Task<ActionResult> PromoteToAdmin(Guid id, [FromBody] PromoteUserRequest request)
    {
        try
        {
            var success = await _userService.PromoteUserAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to promote user." });
            return Ok(new { message = "User promoted to admin successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/demote")]
    public async Task<ActionResult> DemoteFromAdmin(Guid id, [FromBody] DemoteUserRequest request)
    {
        try
        {
            var success = await _userService.DemoteUserAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to demote user." });
            return Ok(new { message = "Admin role removed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("farmers/{farmerId:guid}/approve-seller")]
    public async Task<ActionResult> ApproveSeller(Guid farmerId)
    {
        try
        {
            var success = await _userService.ApproveFarmerSellerAsync(farmerId, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to approve farmer as seller." });
            return Ok(new { message = "Farmer approved as seller successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("farmers/{farmerId:guid}/reject-seller")]
    public async Task<ActionResult> RejectSeller(Guid farmerId, [FromBody] RejectSellerRequest request)
    {
        try
        {
            var success = await _userService.RejectFarmerSellerAsync(farmerId, request.Reason, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to reject seller." });
            return Ok(new { message = "Farmer seller request rejected." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("farmers/{farmerId:guid}/revoke-seller")]
    public async Task<ActionResult> RevokeSeller(Guid farmerId, [FromBody] RejectSellerRequest request)
    {
        try
        {
            var success = await _userService.RevokeFarmerSellerAsync(farmerId, request.Reason, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to revoke seller privilege." });
            return Ok(new { message = "Farmer seller privilege revoked." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
