using FarmerBandh.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Interfaces;

public interface IAdminCategoryService
{
    Task<List<AdminCategoryDto>> GetCategoriesAsync();
    Task<AdminCategoryDto> CreateCategoryAsync(CreateCategoryRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> DeleteCategoryAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null);
    Task<bool> ReorderCategoriesAsync(ReorderCategoriesRequest request, Guid currentAdminId, HttpContext? httpContext = null);
}
