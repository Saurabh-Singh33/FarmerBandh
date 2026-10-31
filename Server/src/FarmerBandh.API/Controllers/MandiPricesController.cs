using FarmerBandh.Application.DTOs.Mandi;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[AllowAnonymous]
public class MandiPricesController : ControllerBase
{
    private readonly IMandiPriceService _mandiPriceService;

    public MandiPricesController(IMandiPriceService mandiPriceService)
    {
        _mandiPriceService = mandiPriceService;
    }

    /// <summary>
    /// Gets Day-wise or Week-wise comparative price data between FarmerBandh app listings and official Indian Mandi rates.
    /// </summary>
    [HttpGet("api/v1/mandi-prices/comparison")]
    public async Task<ActionResult<MandiPriceComparisonResponseDto>> GetComparison(
        [FromQuery] string commodity = "Wheat",
        [FromQuery] string? state = null,
        [FromQuery] string? district = null,
        [FromQuery] string granularity = "day",
        [FromQuery] int points = 14,
        [FromQuery] string unit = "quintal")
    {
        var result = await _mandiPriceService.GetComparisonAsync(commodity, state, district, granularity, points, unit);
        return Ok(result);
    }

    /// <summary>
    /// Fetches live APMC Mandi rates across Indian markets from Live Mandi Network.
    /// </summary>
    [HttpGet("api/v1/mandi-prices/live")]
    [HttpGet("api/mandi/prices")]
    public async Task<ActionResult<MandiLiveRatesResponseDto>> GetLiveRates(
        [FromQuery] string? commodity = null,
        [FromQuery] string? crop = null,
        [FromQuery] string? state = null,
        [FromQuery] string? district = null,
        [FromQuery] int limit = 50)
    {
        string? targetCommodity = commodity ?? crop;
        var result = await _mandiPriceService.GetLiveMandiRatesAsync(targetCommodity, state, district, limit);
        return Ok(result);
    }

    /// <summary>
    /// Filter live Mandi rates by state (e.g. Kerala, Gujarat, Maharashtra).
    /// </summary>
    [HttpGet("api/mandi/prices/state/{state}")]
    [HttpGet("api/v1/mandi-prices/state/{state}")]
    public async Task<ActionResult<MandiLiveRatesResponseDto>> GetLiveRatesByState(
        string state,
        [FromQuery] int limit = 50)
    {
        var result = await _mandiPriceService.GetLiveMandiRatesAsync(null, state, null, limit);
        return Ok(result);
    }

    /// <summary>
    /// Filter live Mandi rates by crop / commodity (e.g. Wheat, Cabbage, Onion).
    /// </summary>
    [HttpGet("api/mandi/prices/crop/{crop}")]
    [HttpGet("api/v1/mandi-prices/crop/{crop}")]
    public async Task<ActionResult<MandiLiveRatesResponseDto>> GetLiveRatesByCrop(
        string crop,
        [FromQuery] int limit = 50)
    {
        var result = await _mandiPriceService.GetLiveMandiRatesAsync(crop, null, null, limit);
        return Ok(result);
    }

    /// <summary>
    /// Filter live Mandi rates by district (e.g. Alappuzha, Ahmedabad, Nashik).
    /// </summary>
    [HttpGet("api/mandi/prices/district/{district}")]
    [HttpGet("api/v1/mandi-prices/district/{district}")]
    public async Task<ActionResult<MandiLiveRatesResponseDto>> GetLiveRatesByDistrict(
        string district,
        [FromQuery] int limit = 50)
    {
        var result = await _mandiPriceService.GetLiveMandiRatesAsync(null, null, district, limit);
        return Ok(result);
    }

    /// <summary>
    /// Returns the list of tracked agricultural commodities available for comparison.
    /// </summary>
    [HttpGet("api/v1/mandi-prices/commodities")]
    public async Task<ActionResult<List<string>>> GetCommodities()
    {
        var list = await _mandiPriceService.GetCommoditiesAsync();
        return Ok(list);
    }

    /// <summary>
    /// Returns the list of Indian states supported for Mandi pricing.
    /// </summary>
    [HttpGet("api/v1/mandi-prices/states")]
    public async Task<ActionResult<List<string>>> GetStates()
    {
        var list = await _mandiPriceService.GetStatesAsync();
        return Ok(list);
    }

    /// <summary>
    /// Returns the list of districts for a given state.
    /// </summary>
    [HttpGet("api/v1/mandi-prices/districts")]
    public async Task<ActionResult<List<string>>> GetDistricts([FromQuery] string? state = null)
    {
        var list = await _mandiPriceService.GetDistrictsAsync(state);
        return Ok(list);
    }
}
