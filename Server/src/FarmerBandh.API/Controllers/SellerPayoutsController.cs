using System.Security.Claims;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/seller/payouts")]
[Authorize(Roles = "Farmer")]
public class SellerPayoutsController : ControllerBase
{
    private readonly IPayoutService _payoutService;

    public SellerPayoutsController(IPayoutService payoutService)
    {
        _payoutService = payoutService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<PayoutItemDto>>> GetPayouts([FromQuery] PayoutQueryParams queryParams)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _payoutService.GetPayoutsAsync(userId, queryParams);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<PayoutSummaryDto>> GetSummary()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var summary = await _payoutService.GetPayoutSummaryAsync(userId);
            return Ok(summary);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<PayoutItemDto>> RequestPayout([FromBody] RequestPayoutDto request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var payout = await _payoutService.RequestPayoutAsync(userId, request);
            return Ok(payout);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/mock-process")]
    public async Task<ActionResult<PayoutItemDto>> MockProcessPayout(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var payout = await _payoutService.MockProcessPayoutAsync(userId, id);
            return Ok(payout);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
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
