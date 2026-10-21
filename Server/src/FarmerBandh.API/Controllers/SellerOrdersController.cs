using System.Security.Claims;
using FarmerBandh.Application.DTOs.CartAndOrders;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/seller/orders")]
[Authorize(Roles = "Farmer")]
public class SellerOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public SellerOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<OrderSummaryDto>>> GetSellerOrders(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _orderService.GetSellerOrdersAsync(userId, status, search, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDetailDto>> GetSellerOrderById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var order = await _orderService.GetSellerOrderByIdAsync(userId, id);
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<OrderDetailDto>> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var updated = await _orderService.UpdateSellerOrderStatusAsync(userId, id, request);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<OrderDetailDto>> RejectOrder(Guid id, [FromBody] RejectOrderRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var rejected = await _orderService.RejectSellerOrderAsync(userId, id, request);
            return Ok(rejected);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/payment-status")]
    public async Task<ActionResult<OrderDetailDto>> UpdatePaymentStatus(Guid id, [FromBody] UpdatePaymentStatusRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var updated = await _orderService.UpdateSellerOrderPaymentStatusAsync(userId, id, request);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }
}
