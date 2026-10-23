using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmerBandh.Infrastructure.Repositories;

public class ContactRepository : IContactRepository
{
    private readonly AppDbContext _context;

    public ContactRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ContactMessage> AddAsync(ContactMessage message)
    {
        await _context.ContactMessages.AddAsync(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<ContactMessage?> GetByIdAsync(Guid id)
    {
        return await _context.ContactMessages.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<(IEnumerable<ContactMessage> Items, int Total)> GetAllAsync(
        string? search,
        string? status,
        string? userType,
        int page,
        int pageSize)
    {
        var query = _context.ContactMessages.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                c.Email.ToLower().Contains(term) ||
                c.Subject.ToLower().Contains(term) ||
                (c.Phone != null && c.Phone.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var s = status.Trim().ToLower();
            query = query.Where(c => c.Status.ToLower() == s);
        }

        if (!string.IsNullOrWhiteSpace(userType) && !userType.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var u = userType.Trim().ToLower();
            query = query.Where(c => c.UserType.ToLower() == u);
        }

        var total = await query.CountAsync();

        var pageNumber = page <= 0 ? 1 : page;
        var limit = pageSize <= 0 ? 20 : (pageSize > 100 ? 100 : pageSize);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return (items, total);
    }

    public async Task<ContactMessage> UpdateAsync(ContactMessage message)
    {
        message.UpdatedAt = DateTime.UtcNow;
        _context.ContactMessages.Update(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var item = await _context.ContactMessages.FirstOrDefaultAsync(c => c.Id == id);
        if (item == null) return false;

        _context.ContactMessages.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
