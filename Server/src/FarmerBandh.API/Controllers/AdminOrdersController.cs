using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/orders")]
public class AdminOrdersController : AdminBaseController
{
    private readonly IAdminOrderService _orderService;

    public AdminOrdersController(IAdminOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult> GetOrders([FromQuery] AdminOrderQuery query)
    {
        var (items, total) = await _orderService.GetOrdersAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminOrderDetailDto>> GetOrderDetail(Guid id)
    {
        var detail = await _orderService.GetOrderDetailAsync(id);
        if (detail == null) return NotFound(new { message = $"Order {id} not found." });
        return Ok(detail);
    }

    [HttpPost("{id:guid}/refund")]
    public async Task<ActionResult> IssueRefund(Guid id, [FromBody] AdminOrderRefundRequest request)
    {
        try
        {
            var success = await _orderService.RefundOrderAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to issue refund." });
            return Ok(new { message = "Refund issued successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/force-complete")]
    public async Task<ActionResult> ForceComplete(Guid id)
    {
        try
        {
            var success = await _orderService.ForceCompleteOrderAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to force complete order." });
            return Ok(new { message = "Order force-completed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult> CancelOrder(Guid id, [FromBody] AdminOrderCancelRequest request)
    {
        try
        {
            var success = await _orderService.CancelOrderAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to cancel order." });
            return Ok(new { message = "Order cancelled successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult> OverrideStatus(Guid id, [FromBody] AdminOrderStatusOverrideRequest request)
    {
        try
        {
            var success = await _orderService.OverrideStatusAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to override order status." });
            return Ok(new { message = "Order status updated successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
