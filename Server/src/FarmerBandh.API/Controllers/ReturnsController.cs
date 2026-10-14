using System.Security.Claims;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Returns;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1")]
public class ReturnsController : ControllerBase
{
    private readonly IReturnService _returnService;

    public ReturnsController(IReturnService returnService)
    {
        _returnService = returnService;
    }

    // Buyer endpoints
    [HttpPost("orders/{id:guid}/return")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<ReturnDetailDto>> CreateReturn(Guid id, [FromBody] CreateReturnRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var ret = await _returnService.CreateReturnAsync(userId, id, request);
            return Ok(ret);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("returns")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<ReturnDetailDto>> CreateReturnRoot([FromBody] CreateReturnRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        if (request.OrderId == Guid.Empty)
        {
            return BadRequest(new { message = "OrderId is required." });
        }

        try
        {
            var ret = await _returnService.CreateReturnAsync(userId, request.OrderId, request);
            return Ok(ret);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("returns")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<PagedResultDto<ReturnSummaryDto>>> GetBuyerReturns(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _returnService.GetBuyerReturnsAsync(userId, status, page, pageSize);
        return Ok(result);
    }

    [HttpGet("returns/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ReturnDetailDto>> GetReturnById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var isFarmer = User.IsInRole("Farmer") || User.IsInRole("farmer");
            var ret = isFarmer
                ? await _returnService.GetSellerReturnByIdAsync(userId, id)
                : await _returnService.GetBuyerReturnByIdAsync(userId, id);
            return Ok(ret);
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

    [HttpPost("returns/{id:guid}/cancel")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<IActionResult> CancelReturn(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _returnService.CancelReturnAsync(userId, id);
            return NoContent();
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

    [HttpDelete("returns/{id:guid}")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<IActionResult> DeleteReturn(Guid id, [FromQuery] bool deleteOrder = false)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _returnService.DeleteReturnAsync(userId, id, deleteOrder);
            return NoContent();
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


    // Seller endpoints
    [HttpGet("seller/returns")]
    [HttpGet("returns/seller")]
    [Authorize(Roles = "Farmer,farmer")]
    public async Task<ActionResult<PagedResultDto<ReturnSummaryDto>>> GetSellerReturns(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _returnService.GetSellerReturnsAsync(userId, status, search, page, pageSize);
        return Ok(result);
    }

    [HttpGet("seller/returns/{id:guid}")]
    [HttpGet("returns/seller/{id:guid}")]
    [Authorize(Roles = "Farmer,farmer")]
    public async Task<ActionResult<ReturnDetailDto>> GetSellerReturnById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var ret = await _returnService.GetSellerReturnByIdAsync(userId, id);
            return Ok(ret);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("seller/returns/{id:guid}/approve")]
    [HttpPost("returns/{id:guid}/approve")]
    [Authorize(Roles = "Farmer,farmer")]
    public async Task<ActionResult<ReturnDetailDto>> ApproveReturn(Guid id, [FromBody] ApproveReturnRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var ret = await _returnService.ApproveSellerReturnAsync(userId, id, request);
            return Ok(ret);
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

    [HttpPost("seller/returns/{id:guid}/reject")]
    [HttpPost("returns/{id:guid}/reject")]
    [Authorize(Roles = "Farmer,farmer")]
    public async Task<ActionResult<ReturnDetailDto>> RejectReturn(Guid id, [FromBody] RejectReturnRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var ret = await _returnService.RejectSellerReturnAsync(userId, id, request);
            return Ok(ret);
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

    [HttpPut("returns/{id:guid}/status")]
    [Authorize(Roles = "Farmer,farmer")]
    public async Task<ActionResult<ReturnDetailDto>> UpdateReturnStatus(Guid id, [FromBody] UpdateReturnStatusDto request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            if (string.Equals(request.Status, "Approved", StringComparison.OrdinalIgnoreCase))
            {
                var ret = await _returnService.ApproveSellerReturnAsync(userId, id, new ApproveReturnRequest { SellerResponse = request.SellerNote });
                return Ok(ret);
            }
            else if (string.Equals(request.Status, "Rejected", StringComparison.OrdinalIgnoreCase))
            {
                var ret = await _returnService.RejectSellerReturnAsync(userId, id, new RejectReturnRequest { SellerResponse = request.SellerNote ?? "Rejected" });
                return Ok(ret);
            }

            return BadRequest(new { message = "Status must be Approved or Rejected." });
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

    [HttpPost("returns/{id:guid}/messages")]
    [Authorize]
    public async Task<ActionResult<ReturnMessageDto>> AddMessage(Guid id, [FromBody] PostReturnMessageRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var msg = await _returnService.AddMessageAsync(userId, id, request);
            return Ok(msg);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("returns/{id:guid}/messages/{messageId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteMessage(Guid id, Guid messageId, [FromQuery] bool forEveryone = true)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _returnService.DeleteMessageAsync(userId, id, messageId, forEveryone);
            return NoContent();
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
