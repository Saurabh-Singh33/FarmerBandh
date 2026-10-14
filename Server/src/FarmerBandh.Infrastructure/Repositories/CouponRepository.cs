using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class CouponRepository : ICouponRepository
{
    private readonly AppDbContext _context;

    public CouponRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Coupon?> GetByCodeAsync(string code)
    {
        var targetCode = code.Trim().ToUpper();
        return await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == targetCode);
    }

    public async Task IncrementUsedCountAsync(string code)
    {
        var coupon = await GetByCodeAsync(code);
        if (coupon != null)
        {
            coupon.UsedCount += 1;
            await _context.SaveChangesAsync();
        }
    }
}
