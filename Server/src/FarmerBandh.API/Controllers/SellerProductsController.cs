using System.Security.Claims;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Authorize(Roles = "Farmer")]
public class SellerProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public SellerProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet("api/v1/seller/products")]
    public async Task<ActionResult<PagedResultDto<ProductSummaryDto>>> GetSellerProducts([FromQuery] ProductQueryParams queryParams)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var result = await _productService.GetSellerProductsAsync(userId, queryParams);
        return Ok(result);
    }

    [HttpPost("api/v1/products")]
    public async Task<ActionResult<ProductDetailDto>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        try
        {
            var created = await _productService.CreateProductAsync(userId, request);
            return CreatedAtAction(nameof(ProductsController.GetProductByIdOrSlug), "Products", new { idOrSlug = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("api/v1/products/{id:guid}")]
    public async Task<ActionResult<ProductDetailDto>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        try
        {
            var updated = await _productService.UpdateProductAsync(userId, id, request);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("api/v1/products/{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        try
        {
            await _productService.SoftDeleteProductAsync(userId, id);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }
}
