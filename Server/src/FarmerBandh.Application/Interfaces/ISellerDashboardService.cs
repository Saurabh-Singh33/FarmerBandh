using FarmerBandh.Application.DTOs.Seller;

namespace FarmerBandh.Application.Interfaces;

public interface ISellerDashboardService
{
    Task<SellerDashboardDto> GetDashboardAsync(Guid userId);
}
