using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/uploads")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadsController> _logger;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"
    };

    private static readonly HashSet<string> AllowedDocumentExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".jpg", ".jpeg", ".png", ".webp"
    };

    public UploadsController(IWebHostEnvironment environment, ILogger<UploadsController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Please select an image file to upload." });
        }

        const long maxSizeBytes = 10 * 1024 * 1024; // 10 MB limit
        if (file.Length > maxSizeBytes)
        {
            return BadRequest(new { message = "File size exceeds the 10 MB limit." });
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Invalid file type. Please upload a JPG, PNG, WebP, or AVIF image." });
        }

        try
        {
            var webRoot = _environment.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var uploadsDir = Path.Combine(webRoot, "uploads", "products");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var uniqueFileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var relativeUrl = $"/uploads/products/{uniqueFileName}";
            var absoluteUrl = $"{baseUrl}{relativeUrl}";

            _logger.LogInformation("Product image uploaded successfully: {FileName}", uniqueFileName);

            return Ok(new
            {
                url = absoluteUrl,
                relativeUrl,
                fileName = uniqueFileName,
                size = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save uploaded image.");
            return StatusCode(500, new { message = "Failed to upload image. Please try again." });
        }
    }

    [HttpPost("document")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Please select a document file to upload." });
        }

        const long maxSizeBytes = 20 * 1024 * 1024; // 20 MB limit
        if (file.Length > maxSizeBytes)
        {
            return BadRequest(new { message = "Document size exceeds the 20 MB limit." });
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedDocumentExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Invalid file type. Please upload a PDF, JPG, PNG, or WebP document." });
        }

        try
        {
            var webRoot = _environment.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var uploadsDir = Path.Combine(webRoot, "uploads", "documents");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var uniqueFileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var relativeUrl = $"/uploads/documents/{uniqueFileName}";
            var absoluteUrl = $"{baseUrl}{relativeUrl}";

            _logger.LogInformation("Verification document uploaded successfully: {FileName}", uniqueFileName);

            return Ok(new
            {
                url = absoluteUrl,
                relativeUrl,
                fileName = uniqueFileName,
                originalName = file.FileName,
                size = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save uploaded document.");
            return StatusCode(500, new { message = "Failed to upload document. Please try again." });
        }
    }
}
