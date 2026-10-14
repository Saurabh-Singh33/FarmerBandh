using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/activity-logs")]
public class AdminActivityLogsController : AdminBaseController
{
    private readonly IAdminActivityService _activityService;

    public AdminActivityLogsController(IAdminActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<ActionResult> GetLogs([FromQuery] AdminActivityLogQuery query)
    {
        var (items, total) = await _activityService.GetActivityLogsAsync(query);
        return Ok(new { items, total, page = query.Page, pageSize = query.PageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminActivityLogDetailDto>> GetLogDetail(Guid id)
    {
        var log = await _activityService.GetActivityLogDetailAsync(id);
        if (log == null) return NotFound(new { message = $"Activity log {id} not found." });
        return Ok(log);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportLogs([FromQuery] AdminActivityLogQuery query)
    {
        var bytes = await _activityService.ExportCsvAsync(query);
        var filename = $"activity_logs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(bytes, "text/csv", filename);
    }
}
