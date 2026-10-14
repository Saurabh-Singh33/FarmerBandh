using FarmerBandh.Application.DTOs.CartAndOrders;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/settings")]
public class SettingsController : ControllerBase
{
    private readonly IOrderService _orderService;

    public SettingsController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("public")]
    public async Task<ActionResult<PublicSettingsDto>> GetPublicSettings()
    {
        var settings = await _orderService.GetPublicSettingsAsync();
        return Ok(settings);
    }
}
