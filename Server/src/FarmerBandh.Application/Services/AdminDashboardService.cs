using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;

namespace FarmerBandh.Application.Services;

public class AdminDashboardService : IAdminDashboardService
{
    private readonly IAdminRepository _adminRepository;

    public AdminDashboardService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        return await _adminRepository.GetDashboardAsync();
    }
}
