using System.Security.Claims;
using FarmerBandh.Application.DTOs.Negotiations;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/negotiations")]
[Route("api/negotiations")]
[Route("negotiations")]
public class NegotiationsController : ControllerBase
{
    private readonly INegotiationService _negotiationService;

    public NegotiationsController(INegotiationService negotiationService)
    {
        _negotiationService = negotiationService;
    }

    // 1. POST /negotiations - Start a new negotiation
    [HttpPost]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<NegotiationDetailDto>> StartNegotiation([FromBody] CreateNegotiationRequestDto request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.StartNegotiationAsync(userId, request);
            return StatusCode(201, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message, statusCode = 400 });
        }
    }

    // 2. GET /negotiations - List buyer's negotiations
    [HttpGet]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<IEnumerable<NegotiationSummaryDto>>> GetBuyerNegotiations(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var list = await _negotiationService.GetBuyerNegotiationsAsync(userId, status, search);
        return Ok(list);
    }

    // 13. GET /negotiations/unread-count - Unread messages count for current user
    [HttpGet("unread-count")]
    [Authorize]
    public async Task<ActionResult<UnreadCountDto>> GetUnreadCount()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var count = await _negotiationService.GetUnreadCountAsync(userId);
        return Ok(count);
    }

    // 3. GET /negotiations/{id} - Full negotiation detail
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<NegotiationDetailDto>> GetNegotiationById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var detail = await _negotiationService.GetBuyerNegotiationDetailAsync(userId, id);
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

    // 4. POST /negotiations/{id}/messages - Send message or counter-offer
    [HttpPost("{id:guid}/messages")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<NegotiationDetailDto>> SendMessage(Guid id, [FromBody] SendNegotiationMessageRequestDto request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.BuyerSendMessageAsync(userId, id, request);
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

    // 5. POST /negotiations/{id}/accept - Buyer accepts farmer's offer
    [HttpPost("{id:guid}/accept")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<NegotiationDetailDto>> Accept(Guid id, [FromBody] AcceptNegotiationRequestDto? request = null)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.BuyerAcceptAsync(userId, id, request ?? new AcceptNegotiationRequestDto());
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

    // 6. POST /negotiations/{id}/reject - Buyer rejects farmer's offer
    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<NegotiationDetailDto>> Reject(Guid id, [FromBody] RejectNegotiationRequestDto? request = null)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.BuyerRejectAsync(userId, id, request ?? new RejectNegotiationRequestDto());
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

    // 7. POST /negotiations/{id}/withdraw - Buyer withdraws their own active offer
    [HttpPost("{id:guid}/withdraw")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<NegotiationDetailDto>> Withdraw(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _negotiationService.BuyerWithdrawAsync(userId, id);
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
