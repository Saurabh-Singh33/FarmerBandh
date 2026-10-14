using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace FarmerBandh.Application.Services;

public class AdminCategoryService : IAdminCategoryService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IActivityLogger _activityLogger;

    public AdminCategoryService(IAdminRepository adminRepository, IActivityLogger activityLogger)
    {
        _adminRepository = adminRepository;
        _activityLogger = activityLogger;
    }

    public async Task<List<AdminCategoryDto>> GetCategoriesAsync()
    {
        return await _adminRepository.GetCategoriesAsync();
    }

    public async Task<AdminCategoryDto> CreateCategoryAsync(CreateCategoryRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? request.Name.Trim().ToLower().Replace(" ", "-")
            : request.Slug.Trim().ToLower();

        var existing = await _adminRepository.GetCategoryBySlugAsync(slug);
        if (existing != null)
        {
            throw new InvalidOperationException($"Category with slug '{slug}' already exists.");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Slug = slug,
            DisplayOrder = request.DisplayOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.AddCategoryAsync(category);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "CATEGORY_CREATED",
            targetType: "Category",
            targetId: category.Id,
            summary: $"Created category '{category.Name}' (slug: {category.Slug})",
            metadata: $"{{\"name\":\"{category.Name}\",\"slug\":\"{category.Slug}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return new AdminCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ProductsCount = 0,
            CreatedAt = category.CreatedAt
        };
    }

    public async Task<bool> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var category = await _adminRepository.GetCategoryByIdAsync(id);
        if (category == null) return false;

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? request.Name.Trim().ToLower().Replace(" ", "-")
            : request.Slug.Trim().ToLower();

        var existing = await _adminRepository.GetCategoryBySlugAsync(slug);
        if (existing != null && existing.Id != id)
        {
            throw new InvalidOperationException($"Another category with slug '{slug}' already exists.");
        }

        category.Name = request.Name.Trim();
        category.Slug = slug;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        await _adminRepository.UpdateCategoryAsync(category);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "CATEGORY_UPDATED",
            targetType: "Category",
            targetId: category.Id,
            summary: $"Updated category '{category.Name}'",
            metadata: $"{{\"name\":\"{category.Name}\",\"isActive\":{category.IsActive.ToString().ToLower()}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> DeleteCategoryAsync(Guid id, Guid currentAdminId, HttpContext? httpContext = null)
    {
        var category = await _adminRepository.GetCategoryByIdAsync(id);
        if (category == null) return false;

        var activeProductsCount = await _adminRepository.GetActiveProductCountForCategoryAsync(id);
        if (activeProductsCount > 0)
        {
            throw new InvalidOperationException($"Cannot deactivate category '{category.Name}' because it has {activeProductsCount} active product(s).");
        }

        category.IsActive = false;
        await _adminRepository.UpdateCategoryAsync(category);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "CATEGORY_DEACTIVATED",
            targetType: "Category",
            targetId: category.Id,
            summary: $"Deactivated category '{category.Name}'",
            metadata: $"{{\"categoryId\":\"{id}\",\"name\":\"{category.Name}\"}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }

    public async Task<bool> ReorderCategoriesAsync(ReorderCategoriesRequest request, Guid currentAdminId, HttpContext? httpContext = null)
    {
        await _adminRepository.UpdateCategoriesOrderAsync(request.Items);
        await _adminRepository.SaveChangesAsync();

        await _activityLogger.LogAsync(
            action: "CATEGORIES_REORDERED",
            targetType: "Category",
            targetId: null,
            summary: $"Reordered {request.Items.Count} categories",
            metadata: $"{{\"count\":{request.Items.Count}}}",
            httpContext: httpContext,
            actorUserId: currentAdminId
        );

        return true;
    }
}
