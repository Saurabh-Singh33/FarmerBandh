using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin")]
public class AdminListingsController : AdminBaseController
{
    private readonly IAdminListingService _listingService;

    public AdminListingsController(IAdminListingService listingService)
    {
        _listingService = listingService;
    }

    [HttpGet("listings")]
    public async Task<ActionResult> GetListings([FromQuery] AdminListingQuery query)
    {
        var (items, total) = await _listingService.GetListingsAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("listings/{id:guid}")]
    public async Task<ActionResult<AdminListingDetailDto>> GetListingDetail(Guid id)
    {
        var detail = await _listingService.GetListingDetailAsync(id);
        if (detail == null) return NotFound(new { message = $"Listing {id} not found." });
        return Ok(detail);
    }

    [HttpPost("listings/{id:guid}/flag")]
    public async Task<ActionResult> FlagListing(Guid id, [FromBody] FlagListingRequest request)
    {
        try
        {
            var success = await _listingService.FlagListingAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to flag listing." });
            return Ok(new { message = "Listing flagged successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("listings/{id:guid}/unflag")]
    public async Task<ActionResult> UnflagListing(Guid id)
    {
        try
        {
            var success = await _listingService.UnflagListingAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to unflag listing." });
            return Ok(new { message = "Listing flag cleared." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("listings/{id:guid}/remove")]
    public async Task<ActionResult> RemoveListing(Guid id, [FromBody] RemoveListingRequest request)
    {
        try
        {
            var success = await _listingService.RemoveListingAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to remove listing." });
            return Ok(new { message = "Listing removed successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("listings/{id:guid}/restore")]
    public async Task<ActionResult> RestoreListing(Guid id)
    {
        try
        {
            var success = await _listingService.RestoreListingAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to restore listing." });
            return Ok(new { message = "Listing restored successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("listings/{id:guid}/feature")]
    public async Task<ActionResult> FeatureListing(Guid id)
    {
        try
        {
            var success = await _listingService.FeatureListingAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to feature listing." });
            return Ok(new { message = "Listing featured successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("listings/{id:guid}/unfeature")]
    public async Task<ActionResult> UnfeatureListing(Guid id)
    {
        try
        {
            var success = await _listingService.UnfeatureListingAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return BadRequest(new { message = "Failed to unfeature listing." });
            return Ok(new { message = "Listing unfeatured successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("featured-listings")]
    public async Task<ActionResult<List<FeaturedListingItemDto>>> GetFeaturedListings()
    {
        var list = await _listingService.GetFeaturedListingsAsync();
        return Ok(list);
    }

    [HttpPut("featured-listings/order")]
    public async Task<ActionResult> ReorderFeaturedListings([FromBody] ReorderFeaturedListingsRequest request)
    {
        var success = await _listingService.ReorderFeaturedListingsAsync(request, GetAdminUserId(), HttpContext);
        if (!success) return BadRequest(new { message = "Failed to reorder featured listings." });
        return Ok(new { message = "Featured listings reordered successfully." });
    }
}
