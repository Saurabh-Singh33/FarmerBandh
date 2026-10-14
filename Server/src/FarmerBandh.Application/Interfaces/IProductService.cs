using FarmerBandh.Application.DTOs.Catalog;

namespace FarmerBandh.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
    Task<PagedResultDto<ProductSummaryDto>> GetProductsAsync(ProductQueryParams queryParams, Guid? userId);
    Task<ProductDetailDto> GetProductByIdOrSlugAsync(string idOrSlug);
    Task<IEnumerable<ProductSummaryDto>> GetSimilarProductsAsync(string idOrSlug);
    Task<PagedResultDto<ProductSummaryDto>> GetSellerProductsAsync(Guid userId, ProductQueryParams queryParams);
    Task<ProductDetailDto> CreateProductAsync(Guid userId, CreateProductRequest request);
    Task<ProductDetailDto> UpdateProductAsync(Guid userId, Guid productId, UpdateProductRequest request);
    Task SoftDeleteProductAsync(Guid userId, Guid productId);
}
