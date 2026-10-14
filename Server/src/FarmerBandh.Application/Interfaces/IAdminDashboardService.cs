using FarmerBandh.Application.DTOs.Admin;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardDto> GetDashboardAsync();
}
