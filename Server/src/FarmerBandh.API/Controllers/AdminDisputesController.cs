using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/disputes")]
public class AdminDisputesController : AdminBaseController
{
    private readonly IAdminDisputeService _disputeService;

    public AdminDisputesController(IAdminDisputeService disputeService)
    {
        _disputeService = disputeService;
    }

    [HttpGet]
    public async Task<ActionResult> GetDisputes([FromQuery] AdminDisputeQuery query)
    {
        var (items, total) = await _disputeService.GetDisputesAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminDisputeDetailDto>> GetDisputeDetail(Guid id)
    {
        var detail = await _disputeService.GetDisputeDetailAsync(id);
        if (detail == null) return NotFound(new { message = $"Dispute {id} not found." });
        return Ok(detail);
    }

    [HttpPost("{id:guid}/escalate")]
    public async Task<ActionResult> Escalate(Guid id)
    {
        try
        {
            var success = await _disputeService.EscalateDisputeAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to escalate dispute." });
            return Ok(new { message = "Dispute escalated to admin arbitration." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/resolve")]
    public async Task<ActionResult> Resolve(Guid id, [FromBody] AdminResolveDisputeRequest request)
    {
        try
        {
            var success = await _disputeService.ResolveDisputeAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to resolve dispute." });
            return Ok(new { message = "Dispute resolved successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/close")]
    public async Task<ActionResult> Close(Guid id)
    {
        try
        {
            var success = await _disputeService.CloseDisputeAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to close dispute." });
            return Ok(new { message = "Dispute closed." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<ActionResult> AddMessage(Guid id, [FromBody] AdminPostDisputeMessageRequest request)
    {
        try
        {
            var success = await _disputeService.PostMessageAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to add message." });
            return Ok(new { message = "Arbitrator message added." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
