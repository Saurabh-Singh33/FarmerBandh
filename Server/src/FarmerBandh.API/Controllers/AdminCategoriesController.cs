using FarmerBandh.Application.DTOs.Admin;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/categories")]
public class AdminCategoriesController : AdminBaseController
{
    private readonly IAdminCategoryService _categoryService;

    public AdminCategoriesController(IAdminCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminCategoryDto>>> GetCategories()
    {
        var list = await _categoryService.GetCategoriesAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<AdminCategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        try
        {
            var cat = await _categoryService.CreateCategoryAsync(request, GetAdminUserId(), HttpContext);
            return Ok(cat);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        try
        {
            var success = await _categoryService.UpdateCategoryAsync(id, request, GetAdminUserId(), HttpContext);
            if (!success) return NotFound(new { message = $"Category {id} not found." });
            return Ok(new { message = "Category updated successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteCategory(Guid id)
    {
        try
        {
            var success = await _categoryService.DeleteCategoryAsync(id, GetAdminUserId(), HttpContext);
            if (!success) return NotFound(new { message = $"Category {id} not found." });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("order")]
    public async Task<ActionResult> ReorderCategories([FromBody] ReorderCategoriesRequest request)
    {
        var success = await _categoryService.ReorderCategoriesAsync(request, GetAdminUserId(), HttpContext);
        if (!success) return BadRequest(new { message = "Failed to reorder categories." });
        return Ok(new { message = "Categories reordered successfully." });
    }
}
