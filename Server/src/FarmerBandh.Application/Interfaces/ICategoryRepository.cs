using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetActiveCategoriesAsync();
    Task<Category?> GetByIdAsync(Guid id);
    Task<Category?> GetBySlugAsync(string slug);
}
