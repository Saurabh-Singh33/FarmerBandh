using System.Security.Claims;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Disputes;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize]
public class DisputesController : ControllerBase
{
    private readonly IDisputeService _disputeService;

    public DisputesController(IDisputeService disputeService)
    {
        _disputeService = disputeService;
    }

    [HttpPost("orders/{id:guid}/dispute")]
    public async Task<ActionResult<DisputeDetailDto>> CreateDispute(Guid id, [FromBody] CreateDisputeRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var dispute = await _disputeService.CreateDisputeAsync(userId, id, request);
            return Ok(dispute);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("disputes")]
    public async Task<ActionResult<DisputeDetailDto>> CreateDisputeDirect([FromBody] CreateDisputeRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        if (!request.OrderId.HasValue || request.OrderId.Value == Guid.Empty)
        {
            return BadRequest(new { message = "Order ID is required to raise a dispute." });
        }

        try
        {
            var dispute = await _disputeService.CreateDisputeAsync(userId, request.OrderId.Value, request);
            return Ok(dispute);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("disputes")]
    public async Task<ActionResult<PagedResultDto<DisputeSummaryDto>>> GetDisputes(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _disputeService.GetUserDisputesAsync(userId, status, page, pageSize);
        return Ok(result);
    }

    [HttpGet("disputes/{id:guid}")]
    public async Task<ActionResult<DisputeDetailDto>> GetDisputeById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var dispute = await _disputeService.GetDisputeByIdAsync(userId, id);
            return Ok(dispute);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("disputes/{id:guid}/messages")]
    public async Task<ActionResult<DisputeDetailDto>> AddMessage(Guid id, [FromBody] PostDisputeMessageRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var dispute = await _disputeService.AddMessageAsync(userId, id, request);
            return Ok(dispute);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("disputes/{id:guid}/resolve")]
    public async Task<ActionResult<DisputeDetailDto>> ResolveDispute(Guid id, [FromBody] ResolveDisputeRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var dispute = await _disputeService.ResolveDisputeAsync(userId, id, request);
            return Ok(dispute);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("disputes/{id:guid}/close")]
    public async Task<ActionResult<DisputeDetailDto>> CloseDispute(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var dispute = await _disputeService.CloseDisputeAsync(userId, id);
            return Ok(dispute);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("disputes/{id:guid}/status")]
    public async Task<ActionResult<DisputeDetailDto>> UpdateStatus(Guid id, [FromBody] UpdateDisputeStatusRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            if (string.Equals(request.Status, "Resolved", StringComparison.OrdinalIgnoreCase))
            {
                var note = !string.IsNullOrWhiteSpace(request.ResolutionNote) ? request.ResolutionNote : (request.ResolutionSummary ?? "Resolved");
                var dispute = await _disputeService.ResolveDisputeAsync(userId, id, new ResolveDisputeRequest { ResolutionNote = note });
                return Ok(dispute);
            }
            else if (string.Equals(request.Status, "Closed", StringComparison.OrdinalIgnoreCase))
            {
                var dispute = await _disputeService.CloseDisputeAsync(userId, id);
                return Ok(dispute);
            }
            return BadRequest(new { message = $"Unsupported status: {request.Status}" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }
}
