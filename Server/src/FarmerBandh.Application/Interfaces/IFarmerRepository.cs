using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IFarmerRepository
{
    Task<Farmer?> GetByIdAsync(Guid farmerId);
    Task<Farmer?> GetByUserIdAsync(Guid userId);
    Task<int> GetActiveListingsCountAsync(Guid farmerId);
    Task<int> GetDeliveredOrdersCountAsync(Guid farmerId);
    Task<double> GetAverageResponseTimeHoursAsync(Guid farmerId);
    Task<int> GetReviewCountAsync(Guid farmerId);
    Task<DateTime?> GetLastOrderDateForBuyerAsync(Guid buyerId, Guid farmerId);
    Task<IEnumerable<Product>> GetActiveProductsAsync(Guid farmerId, int page = 1, int pageSize = 12);
    Task<int> GetActiveProductsCountAsync(Guid farmerId);
}
