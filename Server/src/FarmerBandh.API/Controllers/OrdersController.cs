using System.Security.Claims;
using FarmerBandh.Application.DTOs.CartAndOrders;
using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<OrderPlacementResultDto>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _orderService.CreateOrderAsync(userId, request);
            return Ok(result);
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

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<OrderSummaryDto>>> GetBuyerOrders(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var result = await _orderService.GetBuyerOrdersAsync(userId, status, search, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrderById(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var order = await _orderService.GetBuyerOrderByIdAsync(userId, id);
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderRequest? request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _orderService.CancelBuyerOrderAsync(userId, id, request?.Reason);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reorder")]
    public async Task<ActionResult<OrderPlacementResultDto>> Reorder(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _orderService.ReorderAsync(userId, id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteOrder(Guid id)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            await _orderService.DeleteBuyerOrderAsync(userId, id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/pay")]
    public async Task<ActionResult<OrderDetailDto>> PayOrder(Guid id, [FromBody] RecordPaymentRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _orderService.RecordOrderPaymentAsync(userId, id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : Guid.Empty;
    }

    [HttpPost("dispatch-payment-receipt")]
    [AllowAnonymous]
    public async Task<IActionResult> DispatchPaymentReceipt(
        [FromBody] PaymentReceiptEmailRequest req,
        [FromServices] IEmailService emailService)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Email is required." });

        var subject = $"Payment Escrow Secured: INR {req.Amount:N2} — FarmerBandh";
        var html = $"""
        <div style='font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding:24px; color:#1e293b; max-width:600px; margin:0 auto; border:1px solid #e2e8f0; border-radius:16px; background:#ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.05);'>
          <div style='background:linear-gradient(135deg, #1B4D3E 0%, #064E3B 100%); color:#fff; padding:24px; border-radius:12px; text-align:center;'>
            <h2 style='margin:0; font-size:22px; font-weight:800;'>Payment Received & Escrow Secured</h2>
            <p style='margin:4px 0 0 0; color:#a7f3d0; font-size:12px; text-transform:uppercase; letter-spacing:0.06em; font-weight:700;'>FarmerBandh Agrarian Escrow Protocol</p>
          </div>
          <div style='padding:24px 8px 16px 8px;'>
            <p style='font-size:15px; margin:0 0 16px 0;'>Hello <strong>{(string.IsNullOrWhiteSpace(req.CustomerName) ? "Valued Patron" : WebUtility.HtmlEncode(req.CustomerName))}</strong>,</p>
            <p style='font-size:14px; color:#475569; line-height:1.6; margin:0 0 20px 0;'>
              Your payment of <strong style='color:#0f172a; font-size:16px;'>₹{req.Amount:N2}</strong> has been secured in Razorpay Escrow.
            </p>
            <div style='background:#f8fafc; padding:16px 20px; border-radius:12px; border:1px solid #e2e8f0; font-size:13px; line-height:1.7;'>
              <div><span style='color:#64748b; font-weight:600;'>Payment Reference:</span> <strong style='color:#0f172a; font-family:monospace;'>{WebUtility.HtmlEncode(req.PaymentId ?? "pay_simulated")}</strong></div>
              <div><span style='color:#64748b; font-weight:600;'>Payment Link:</span> <span style='font-family:monospace; color:#0f172a;'>{WebUtility.HtmlEncode(req.PaymentLinkId ?? "plink_Tqe4bgUXaopgZ0")}</span></div>
              <div><span style='color:#64748b; font-weight:600;'>Payment Method:</span> <strong style='color:#0f172a;'>{WebUtility.HtmlEncode(req.Method?.ToUpperInvariant() ?? "UPI")}</strong></div>
              <div><span style='color:#64748b; font-weight:600;'>Registered Phone:</span> <span style='color:#0f172a;'>{WebUtility.HtmlEncode(req.Phone ?? "+919508461241")}</span></div>
              <div><span style='color:#64748b; font-weight:600;'>Escrow Settlement:</span> <span style='color:#059669; font-weight:700;'>Protected & Guaranteed</span></div>
            </div>
            <div style='background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-top:20px; font-size:12.5px; color:#166534; line-height:1.5;'>
              <strong>🛡️ Escrow Assurance:</strong> Funds are safely reserved in trust and will be released to the agricultural seller only after you inspect and accept your crop delivery.
            </div>
            <p style='font-size:12px; color:#94a3b8; margin-top:24px; text-align:center;'>
              Need assistance? Contact our team at <a href='mailto:saurabhsinghdeveloper591@gmail.com' style='color:#059669;'>saurabhsinghdeveloper591@gmail.com</a>
            </p>
          </div>
        </div>
        """;

        var ok = await emailService.SendEmailAsync(req.Email, subject, html);
        return Ok(new { success = ok, message = ok ? "Receipt dispatched to email." : "Failed to deliver email." });
    }

    public class CancelOrderRequest
    {
        public string? Reason { get; set; }
    }

    public class PaymentReceiptEmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string? CustomerName { get; set; }
        public string? Phone { get; set; }
        public decimal Amount { get; set; }
        public string? PaymentId { get; set; }
        public string? PaymentLinkId { get; set; }
        public string? Method { get; set; }
    }
}
