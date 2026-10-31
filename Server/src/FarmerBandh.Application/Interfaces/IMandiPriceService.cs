using FarmerBandh.Application.DTOs.Mandi;

namespace FarmerBandh.Application.Interfaces;

public interface IMandiPriceService
{
    Task<MandiPriceComparisonResponseDto> GetComparisonAsync(
        string commodity,
        string? state = null,
        string? district = null,
        string granularity = "day",
        int points = 14,
        string unit = "quintal");

    Task<MandiLiveRatesResponseDto> GetLiveMandiRatesAsync(
        string? commodity = null,
        string? state = null,
        string? district = null,
        int limit = 50);

    Task<List<string>> GetCommoditiesAsync();

    Task<List<string>> GetStatesAsync();

    Task<List<string>> GetDistrictsAsync(string? state = null);
}
