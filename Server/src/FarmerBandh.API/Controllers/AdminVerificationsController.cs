using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/verifications")]
public class AdminVerificationsController : AdminBaseController
{
    private readonly IAdminVerificationService _verificationService;

    public AdminVerificationsController(IAdminVerificationService verificationService)
    {
        _verificationService = verificationService;
    }

    [HttpGet]
    public async Task<ActionResult> GetVerifications([FromQuery] AdminVerificationQuery query)
    {
        var (items, total) = await _verificationService.GetVerificationsAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminVerificationDetailDto>> GetVerificationDetail(Guid id)
    {
        var detail = await _verificationService.GetVerificationDetailAsync(id);
        if (detail == null) return NotFound(new { message = $"Verification request {id} not found." });
        return Ok(detail);
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<ActionResult> Approve(Guid id)
    {
        try
        {
            var success = await _verificationService.ApproveVerificationAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to approve verification." });
            return Ok(new { message = "Verification request approved successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult> Reject(Guid id, [FromBody] RejectVerificationRequest request)
    {
        try
        {
            var success = await _verificationService.RejectVerificationAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to reject verification." });
            return Ok(new { message = "Verification request rejected." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
