using System.Security.Claims;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Reviews;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost("orders/{id:guid}/reviews")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<List<ReviewDto>>> CreateOrderReviews(Guid id, [FromBody] CreateOrderReviewsRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var reviews = await _reviewService.CreateOrderReviewsAsync(userId, id, request);
            return Ok(reviews);
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

    [HttpGet("orders/{id:guid}/reviews")]
    [Authorize]
    public async Task<ActionResult<List<ReviewDto>>> GetOrderReviews(Guid id)
    {
        var reviews = await _reviewService.GetOrderReviewsAsync(id);
        return Ok(reviews);
    }

    [HttpGet("products/{id:guid}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResultDto<ReviewDto>>> GetProductReviews(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _reviewService.GetProductReviewsAsync(id, page, pageSize);
        return Ok(result);
    }

    [HttpGet("farmers/{id:guid}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResultDto<ReviewDto>>> GetFarmerReviews(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _reviewService.GetFarmerReviewsAsync(id, page, pageSize);
        return Ok(result);
    }

    [HttpPut("reviews/{id:guid}")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<ActionResult<ReviewDto>> UpdateReview(Guid id, [FromBody] UpdateReviewRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var updated = await _reviewService.UpdateReviewAsync(userId, id, request);
            return Ok(updated);
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

    [HttpDelete("reviews/{id:guid}")]
    [Authorize(Roles = "Buyer,buyer")]
    public async Task<IActionResult> DeleteReview(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _reviewService.DeleteReviewAsync(userId, id);
            return NoContent();
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
