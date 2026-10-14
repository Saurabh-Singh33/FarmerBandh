using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Review>> CreateRangeAsync(IEnumerable<Review> reviews)
    {
        await _context.Reviews.AddRangeAsync(reviews);
        await _context.SaveChangesAsync();
        return reviews.ToList();
    }

    public async Task<Review?> GetByIdAsync(Guid id)
    {
        return await _context.Reviews
            .Include(r => r.Order)
            .Include(r => r.Product)
            .Include(r => r.Buyer)
                .ThenInclude(b => b.User)
            .Include(r => r.Farmer)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<bool> HasReviewedOrderAsync(Guid orderId)
    {
        return await _context.Reviews.AnyAsync(r => r.OrderId == orderId);
    }

    public async Task<List<Review>> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.Reviews
            .AsNoTracking()
            .Include(r => r.Buyer)
                .ThenInclude(b => b.User)
            .Include(r => r.Product)
            .Include(r => r.Farmer)
            .Where(r => r.OrderId == orderId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review?> GetByOrderAndProductAsync(Guid orderId, Guid productId)
    {
        return await _context.Reviews
            .Include(r => r.Buyer)
                .ThenInclude(b => b.User)
            .Include(r => r.Product)
            .Include(r => r.Farmer)
            .FirstOrDefaultAsync(r => r.OrderId == orderId && r.ProductId == productId);
    }

    public async Task<(IEnumerable<Review> Items, int TotalCount, double AverageRating)> GetProductReviewsAsync(Guid productId, int page, int pageSize)
    {
        var query = _context.Reviews
            .AsNoTracking()
            .Include(r => r.Buyer)
                .ThenInclude(b => b.User)
            .Include(r => r.Product)
            .Where(r => r.ProductId == productId);

        int totalCount = await query.CountAsync();
        double average = totalCount > 0 ? await query.AverageAsync(r => (double)r.Rating) : 0.0;

        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount, Math.Round(average, 1));
    }

    public async Task<(IEnumerable<Review> Items, int TotalCount, double AverageRating)> GetFarmerReviewsAsync(Guid farmerId, int page, int pageSize)
    {
        var query = _context.Reviews
            .AsNoTracking()
            .Include(r => r.Buyer)
                .ThenInclude(b => b.User)
            .Include(r => r.Product)
            .Where(r => r.FarmerId == farmerId);

        int totalCount = await query.CountAsync();
        double average = totalCount > 0 ? await query.AverageAsync(r => (double)r.Rating) : 0.0;

        int p = page < 1 ? 1 : page;
        int ps = pageSize < 1 ? 10 : Math.Min(pageSize, 50);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToListAsync();

        return (items, totalCount, Math.Round(average, 1));
    }

    public async Task UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Review review)
    {
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
    }

    public async Task RecalculateProductRatingAsync(Guid productId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product != null)
        {
            var reviews = await _context.Reviews.Where(r => r.ProductId == productId).ToListAsync();
            if (reviews.Any())
            {
                product.Rating = (decimal)Math.Round(reviews.Average(r => r.Rating), 1);
                product.RatingCount = reviews.Count;
            }
            else
            {
                product.Rating = 0m;
                product.RatingCount = 0;
            }
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RecalculateFarmerRatingAsync(Guid farmerId)
    {
        var farmer = await _context.Farmers.FirstOrDefaultAsync(f => f.Id == farmerId);
        if (farmer != null)
        {
            var reviews = await _context.Reviews.Where(r => r.FarmerId == farmerId).ToListAsync();
            if (reviews.Any())
            {
                farmer.Rating = (decimal)Math.Round(reviews.Average(r => r.Rating), 1);
            }
            else
            {
                farmer.Rating = 0m;
            }
            _context.Farmers.Update(farmer);
            await _context.SaveChangesAsync();
        }
    }
}
