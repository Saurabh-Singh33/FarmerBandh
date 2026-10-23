using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IContactRepository
{
    Task<ContactMessage> AddAsync(ContactMessage message);
    Task<ContactMessage?> GetByIdAsync(Guid id);
    Task<(IEnumerable<ContactMessage> Items, int Total)> GetAllAsync(string? search, string? status, string? userType, int page, int pageSize);
    Task<ContactMessage> UpdateAsync(ContactMessage message);
    Task<bool> DeleteAsync(Guid id);
}
