using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IProductRepository
{
    Task<(IEnumerable<Product> Items, int TotalCount)> GetProductsAsync(ProductQueryParams queryParams);
    Task<Product?> GetByIdOrSlugAsync(string idOrSlug);
    Task<IEnumerable<Product>> GetSimilarProductsAsync(Guid currentProductId, Guid categoryId, int count = 8);
    Task<(IEnumerable<Product> Items, int TotalCount)> GetSellerProductsAsync(Guid farmerId, ProductQueryParams queryParams);
    Task<Product?> GetByIdAsync(Guid id);
    Task<Farmer?> GetFarmerByUserIdAsync(Guid userId);
    Task<Farmer?> GetFarmerByIdAsync(Guid farmerId);
    Task<Buyer?> GetBuyerByUserIdAsync(Guid userId);
    Task<Product> CreateAsync(Product product);
    Task UpdateAsync(Product product);
    Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null);
    Task<HashSet<Guid>> GetFeaturedProductIdsAsync();
    Task<bool> IsProductFeaturedAsync(Guid productId);
}
