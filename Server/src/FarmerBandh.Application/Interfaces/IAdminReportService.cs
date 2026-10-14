using FarmerBandh.Application.DTOs.Admin;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminReportService
{
    Task<AdminReportOverviewDto> GetOverviewAsync(DateTime? from, DateTime? to);
    Task<List<AdminRevenueSeriesPoint>> GetRevenueSeriesAsync(string granularity, DateTime? from, DateTime? to);
    Task<List<AdminUserGrowthSeriesPoint>> GetUserGrowthSeriesAsync(DateTime? from, DateTime? to);
    Task<List<AdminTopFarmerDto>> GetTopFarmersAsync(int limit, DateTime? from, DateTime? to);
    Task<List<AdminTopBuyerDto>> GetTopBuyersAsync(int limit, DateTime? from, DateTime? to);
    Task<List<AdminTopProductDto>> GetTopProductsAsync(int limit, DateTime? from, DateTime? to);
    Task<List<AdminCategoryReportDto>> GetCategoriesAsync(DateTime? from, DateTime? to);
    Task<List<AdminLocationReportDto>> GetLocationsAsync(DateTime? from, DateTime? to);
    Task<byte[]> ExportCsvAsync(string type, DateTime? from, DateTime? to);
}
