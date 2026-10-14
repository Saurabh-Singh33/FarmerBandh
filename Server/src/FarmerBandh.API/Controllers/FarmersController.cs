using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Farmers;
using FarmerBandh.Application.DTOs.Reviews;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/farmers")]
[Route("api/farmers")]
[Route("farmers")]
[AllowAnonymous]
public class FarmersController : ControllerBase
{
    private readonly IFarmerPublicService _farmerPublicService;

    public FarmersController(IFarmerPublicService farmerPublicService)
    {
        _farmerPublicService = farmerPublicService;
    }

    // 18. GET /farmers/{id} - Public farmer profile
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FarmerPublicProfileDto>> GetPublicProfile(Guid id)
    {
        try
        {
            var profile = await _farmerPublicService.GetPublicProfileAsync(id);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
    }

    // 19. GET /farmers/{id}/listings - Public active product listings
    [HttpGet("{id:guid}/listings")]
    public async Task<ActionResult<PagedResultDto<ProductSummaryDto>>> GetFarmerListings(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        try
        {
            var listings = await _farmerPublicService.GetFarmerListingsAsync(id, page, pageSize);
            return Ok(listings);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message, statusCode = 404 });
        }
    }
}
