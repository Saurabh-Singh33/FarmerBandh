using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/reports")]
public class AdminReportsController : AdminBaseController
{
    private readonly IAdminReportService _reportService;

    public AdminReportsController(IAdminReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AdminReportOverviewDto>> GetOverview([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetOverviewAsync(from, to);
        return Ok(result);
    }

    [HttpGet("revenue")]
    public async Task<ActionResult<List<AdminRevenueSeriesPoint>>> GetRevenue([FromQuery] string granularity = "day", [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var result = await _reportService.GetRevenueSeriesAsync(granularity, from, to);
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserGrowthSeriesPoint>>> GetUsers([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetUserGrowthSeriesAsync(from, to);
        return Ok(result);
    }

    [HttpGet("top-farmers")]
    public async Task<ActionResult<List<AdminTopFarmerDto>>> GetTopFarmers([FromQuery] int limit = 10, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var result = await _reportService.GetTopFarmersAsync(limit, from, to);
        return Ok(result);
    }

    [HttpGet("top-buyers")]
    public async Task<ActionResult<List<AdminTopBuyerDto>>> GetTopBuyers([FromQuery] int limit = 10, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var result = await _reportService.GetTopBuyersAsync(limit, from, to);
        return Ok(result);
    }

    [HttpGet("top-products")]
    public async Task<ActionResult<List<AdminTopProductDto>>> GetTopProducts([FromQuery] int limit = 10, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var result = await _reportService.GetTopProductsAsync(limit, from, to);
        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<AdminCategoryReportDto>>> GetCategories([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetCategoriesAsync(from, to);
        return Ok(result);
    }

    [HttpGet("locations")]
    public async Task<ActionResult<List<AdminLocationReportDto>>> GetLocations([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetLocationsAsync(from, to);
        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv([FromQuery] string type, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        try
        {
            var bytes = await _reportService.ExportCsvAsync(type, from, to);
            var filename = $"farmerbandh_{type}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return File(bytes, "text/csv", filename);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
