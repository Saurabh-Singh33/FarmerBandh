using System.Text;
using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;

namespace FarmerBandh.Application.Services;

public class AdminActivityService : IAdminActivityService
{
    private readonly IAdminRepository _adminRepository;

    public AdminActivityService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<(IEnumerable<AdminActivityLogListItemDto> Items, int TotalCount)> GetActivityLogsAsync(AdminActivityLogQuery query)
    {
        return await _adminRepository.GetActivityLogsAsync(query);
    }

    public async Task<AdminActivityLogDetailDto?> GetActivityLogDetailAsync(Guid id)
    {
        return await _adminRepository.GetActivityLogDetailAsync(id);
    }

    public async Task<byte[]> ExportCsvAsync(AdminActivityLogQuery query)
    {
        var logs = await _adminRepository.GetActivityLogsForExportAsync(query);

        var sb = new StringBuilder();
        sb.AppendLine("Timestamp (UTC),Actor,Role,Action,Target Type,Target ID,Summary,IP Address");

        foreach (var log in logs)
        {
            var actor = log.ActorUser != null ? log.ActorUser.FullName : "System";
            var summary = (log.Summary ?? string.Empty).Replace("\"", "\"\"");
            var ip = log.IpAddress ?? string.Empty;

            sb.AppendLine($"\"{log.CreatedAt:yyyy-MM-dd HH:mm:ss}\",\"{actor}\",\"{log.ActorRole}\",\"{log.Action}\",\"{log.TargetType}\",\"{log.TargetId}\",\"{summary}\",\"{ip}\"");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
