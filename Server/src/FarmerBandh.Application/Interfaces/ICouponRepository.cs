using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface ICouponRepository
{
    Task<Coupon?> GetByCodeAsync(string code);
    Task IncrementUsedCountAsync(string code);
}
