using System.Security.Claims;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ProductSummaryDto>>> GetProducts([FromQuery] ProductQueryParams queryParams)
    {
        Guid? userId = null;
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (Guid.TryParse(subClaim, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _productService.GetProductsAsync(queryParams, userId);
        return Ok(result);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<ActionResult<ProductDetailDto>> GetProductByIdOrSlug(string idOrSlug)
    {
        try
        {
            var product = await _productService.GetProductByIdOrSlugAsync(idOrSlug);
            return Ok(product);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{idOrSlug}/similar")]
    public async Task<ActionResult<IEnumerable<ProductSummaryDto>>> GetSimilarProducts(string idOrSlug)
    {
        var list = await _productService.GetSimilarProductsAsync(idOrSlug);
        return Ok(list);
    }
}
