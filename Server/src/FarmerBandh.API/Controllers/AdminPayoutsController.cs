using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/payouts")]
public class AdminPayoutsController : AdminBaseController
{
    private readonly IAdminPayoutService _payoutService;

    public AdminPayoutsController(IAdminPayoutService payoutService)
    {
        _payoutService = payoutService;
    }

    [HttpGet]
    public async Task<ActionResult> GetPayouts([FromQuery] AdminPayoutQuery query)
    {
        var (items, total) = await _payoutService.GetPayoutsAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminPayoutDetailDto>> GetPayoutDetail(Guid id)
    {
        var detail = await _payoutService.GetPayoutDetailAsync(id);
        if (detail == null) return NotFound(new { message = $"Payout {id} not found." });
        return Ok(detail);
    }

    [HttpPost("{id:guid}/process")]
    public async Task<ActionResult> ProcessPayout(Guid id)
    {
        try
        {
            var success = await _payoutService.ProcessPayoutAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to process payout." });
            return Ok(new { message = "Payout processed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/mark-failed")]
    public async Task<ActionResult> MarkFailed(Guid id, [FromBody] AdminMarkPayoutFailedRequest request)
    {
        try
        {
            var success = await _payoutService.MarkFailedAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to mark payout as failed." });
            return Ok(new { message = "Payout marked as failed." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/retry")]
    public async Task<ActionResult> RetryPayout(Guid id)
    {
        try
        {
            var success = await _payoutService.RetryPayoutAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to retry payout." });
            return Ok(new { message = "Payout status reset to Pending for retry." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("bulk-process")]
    public async Task<ActionResult> BulkProcess([FromBody] AdminBulkProcessPayoutRequest request)
    {
        var count = await _payoutService.BulkProcessPayoutsAsync(request, GetAdminUserId(), HttpContext);
        return Ok(new { processedCount = count, message = $"Successfully processed {count} payout(s)." });
    }
}
