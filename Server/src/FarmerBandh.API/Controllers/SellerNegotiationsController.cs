using System.Security.Claims;
using FarmerBandh.Application.DTOs.Negotiations;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/seller/negotiations")]
[Route("api/seller/negotiations")]
[Route("seller/negotiations")]
[Authorize(Roles = "Farmer,farmer")]
public class SellerNegotiationsController : ControllerBase
{
    private readonly INegotiationService _negotiationService;

    public SellerNegotiationsController(INegotiationService negotiationService)
    {
        _negotiationService = negotiationService;
    }

    // 8. GET /seller/negotiations - List seller's negotiations
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NegotiationSummaryDto>>> GetSellerNegotiations(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var list = await _negotiationService.GetSellerNegotiationsAsync(userId, status, search);
        return Ok(list);
    }

    // 9. GET /seller/negotiations/{id} - Full seller negotiation detail
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NegotiationDetailDto>> GetSellerNegotiationById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var detail = await _negotiationService.GetSellerNegotiationDetailAsync(userId, id);
            return Ok(detail);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message, statusCode = 403 });
        }
    }

    // 10. POST /seller/negotiations/{id}/messages - Send message or counter-offer
    [HttpPost("{id:guid}/messages")]
    public async Task<ActionResult<NegotiationDetailDto>> SendMessage(Guid id, [FromBody] SendNegotiationMessageRequestDto request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.SellerSendMessageAsync(userId, id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message, statusCode = 400 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message, statusCode = 403 });
        }
    }

    // 11. POST /seller/negotiations/{id}/accept - Farmer accepts buyer's offer
    [HttpPost("{id:guid}/accept")]
    public async Task<ActionResult<NegotiationDetailDto>> Accept(Guid id, [FromBody] AcceptNegotiationRequestDto? request = null)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.SellerAcceptAsync(userId, id, request ?? new AcceptNegotiationRequestDto());
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message, statusCode = 400 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message, statusCode = 403 });
        }
    }

    // 12. POST /seller/negotiations/{id}/reject - Farmer rejects buyer's offer
    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<NegotiationDetailDto>> Reject(Guid id, [FromBody] RejectNegotiationRequestDto? request = null)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.SellerRejectAsync(userId, id, request ?? new RejectNegotiationRequestDto());
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message, statusCode = 400 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message, statusCode = 403 });
        }
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }
}
