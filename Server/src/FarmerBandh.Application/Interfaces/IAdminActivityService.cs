using FarmerBandh.Application.DTOs.Admin;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminActivityService
{
    Task<(IEnumerable<AdminActivityLogListItemDto> Items, int TotalCount)> GetActivityLogsAsync(AdminActivityLogQuery query);
    Task<AdminActivityLogDetailDto?> GetActivityLogDetailAsync(Guid id);
    Task<byte[]> ExportCsvAsync(AdminActivityLogQuery query);
}
