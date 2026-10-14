using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/refunds")]
public class AdminRefundsController : AdminBaseController
{
    private readonly IAdminRefundService _refundService;

    public AdminRefundsController(IAdminRefundService refundService)
    {
        _refundService = refundService;
    }

    [HttpGet]
    public async Task<ActionResult> GetRefunds([FromQuery] AdminRefundQuery query)
    {
        var (items, total) = await _refundService.GetRefundsAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminRefundDetailDto>> GetRefundDetail(Guid id)
    {
        var detail = await _refundService.GetRefundDetailAsync(id);
        if (detail == null) return NotFound(new { message = $"Refund {id} not found." });
        return Ok(detail);
    }

    [HttpPost("{id:guid}/process")]
    public async Task<ActionResult> ProcessRefund(Guid id)
    {
        try
        {
            var success = await _refundService.ProcessRefundAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to process refund." });
            return Ok(new { message = "Refund processed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/fail")]
    public async Task<ActionResult> FailRefund(Guid id, [FromBody] AdminFailRefundRequest request)
    {
        try
        {
            var success = await _refundService.FailRefundAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to mark refund as failed." });
            return Ok(new { message = "Refund marked as failed." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
