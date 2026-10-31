using System.Net;
using System.Net.Mail;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FarmerBandh.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, string? replyTo = null)
    {
        var host = GetConfigValue("SMTP_HOST");
        var portStr = GetConfigValue("SMTP_PORT") ?? "587";
        var user = GetConfigValue("SMTP_USER");
        var pass = GetConfigValue("SMTP_PASS");
        var sslStr = GetConfigValue("SMTP_ENABLE_SSL") ?? "true";
        var fromEmail = GetConfigValue("SMTP_FROM_EMAIL") ?? user ?? "support@farmerbandh.com";
        var fromName = GetConfigValue("SMTP_FROM_NAME") ?? "FarmerBandh Support Desk";

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass))
        {
            var warning = $"SMTP credentials not fully configured in environment (host='{host}', user='{user}', pass set: {!string.IsNullOrWhiteSpace(pass)}). Skipping email dispatch to {toEmail}.";
            _logger.LogInformation(warning);
            TryAppendDebugLog(warning);
            return false;
        }

        if (!int.TryParse(portStr, out var port))
        {
            port = 587;
        }

        var enableSsl = !bool.TryParse(sslStr, out var ssl) || ssl;

        // Clean password of any spaces provided by Google app password UI
        pass = pass.Replace(" ", "");

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(toEmail));

            if (!string.IsNullOrWhiteSpace(replyTo))
            {
                message.ReplyToList.Add(new MailAddress(replyTo));
            }

            using var client = new SmtpClient(host, port)
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 20000
            };

            TryAppendDebugLog($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] Attempting to send '{subject}' to '{toEmail}' from '{fromEmail}' via {host}:{port} (User: {user})");
            await client.SendMailAsync(message);
            _logger.LogInformation("Email successfully sent to {ToEmail} (Subject: {Subject})", toEmail, subject);
            TryAppendDebugLog($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] SUCCESS: Email successfully delivered to {toEmail}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail} via SMTP {Host}:{Port}", toEmail, host, port);
            TryAppendDebugLog($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] ERROR sending to {toEmail}: {ex.Message}\n{ex.StackTrace}");
            return false;
        }
    }

    public async Task<bool> SendContactInquiryAdminAlertAsync(ContactMessage message)
    {
        var adminEmail = GetConfigValue("ADMIN_NOTIFICATION_EMAIL")
                         ?? GetConfigValue("ADMIN_EMAIL")
                         ?? "admin@farmerbandh.com";

        var subject = $"[FarmerBandh Support] New Inquiry from {message.Name} ({message.UserType.ToUpperInvariant()}): {message.Subject}";

        var html = $$"""
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fbf8; margin: 0; padding: 24px; color: #1f2937; }
    .card { background: #ffffff; max-width: 620px; margin: 0 auto; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .header { background: #1B4D3E; padding: 24px; color: #ffffff; text-align: center; }
    .header h2 { margin: 0 0 6px 0; font-size: 22px; }
    .header p { margin: 0; color: #a7f3d0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
    .body { padding: 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #e8f5e9; color: #1b4d3e; margin-bottom: 16px; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 12px; font-weight: 700; color: #059669; text-transform: uppercase; margin-bottom: 4px; }
    .field-val { font-size: 15px; color: #111827; }
    .message-box { background: #f3f4f6; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 6px; font-size: 14.5px; line-height: 1.6; white-space: pre-wrap; }
    .footer { background: #f9fafb; padding: 18px 28px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <p>FarmerBandh Platform — New Contact Message</p>
      <h2>Direct Inbound Inquiry</h2>
    </div>
    <div class='body'>
      <span class='badge'>User Role: {{WebUtility.HtmlEncode(message.UserType.ToUpperInvariant())}}</span>
      
      <div class='field'>
        <div class='field-label'>Sender Full Name</div>
        <div class='field-val'><strong>{{WebUtility.HtmlEncode(message.Name)}}</strong></div>
      </div>

      <div class='field'>
        <div class='field-label'>Email Address</div>
        <div class='field-val'><a href='mailto:{{WebUtility.HtmlEncode(message.Email)}}'>{{WebUtility.HtmlEncode(message.Email)}}</a></div>
      </div>

      <div class='field'>
        <div class='field-label'>Phone Number</div>
        <div class='field-val'>{{WebUtility.HtmlEncode(message.Phone ?? "Not provided")}}</div>
      </div>

      <div class='field'>
        <div class='field-label'>Subject</div>
        <div class='field-val'>{{WebUtility.HtmlEncode(message.Subject)}}</div>
      </div>

      <div class='field'>
        <div class='field-label'>Message Content</div>
        <div class='message-box'>{{WebUtility.HtmlEncode(message.Message)}}</div>
      </div>

      <div class='field' style='margin-top: 24px;'>
        <div class='field-label'>Submitted At (UTC)</div>
        <div class='field-val' style='font-size: 13px; color: #6b7280;'>{{message.CreatedAt:yyyy-MM-dd HH:mm:ss}} UTC</div>
      </div>
    </div>
    <div class='footer'>
      You can manage and reply to this message directly in the FarmerBandh Admin Portal.
    </div>
  </div>
</body>
</html>
""";

        return await SendEmailAsync(adminEmail, subject, html, replyTo: message.Email);
    }

    public async Task<bool> SendContactInquiryAcknowledgmentAsync(ContactMessage message)
    {
        var subject = $"We have received your message: {message.Subject} — FarmerBandh Support";

        var html = $$"""
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fbf8; margin: 0; padding: 24px; color: #1f2937; }
    .card { background: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: #1B4D3E; padding: 24px; color: #ffffff; text-align: center; }
    .header h2 { margin: 0 0 6px 0; font-size: 22px; }
    .body { padding: 28px; line-height: 1.6; font-size: 15px; }
    .quote { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px 18px; border-radius: 8px; margin: 18px 0; color: #1b4d3e; }
    .footer { background: #f9fafb; padding: 18px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h2>FarmerBandh (किसान बंधु)</h2>
      <p style='margin:0; color:#d1fae5; font-size:14px;'>Direct Agricultural Trade & Support</p>
    </div>
    <div class='body'>
      <p>Namaste <strong>{{WebUtility.HtmlEncode(message.Name)}}</strong>,</p>
      <p>Thank you for reaching out to the FarmerBandh operational desk. We have received your inquiry regarding <strong>"{{WebUtility.HtmlEncode(message.Subject)}}"</strong>.</p>
      
      <div class='quote'>
        <strong>Your Message:</strong><br/>
        {{WebUtility.HtmlEncode(message.Message)}}
      </div>

      <p>Our team reviews messages on business days (Monday to Saturday, 9:00 AM – 6:00 PM IST). A support officer will follow up with you shortly at this email address.</p>

      <p>If your query is urgent, you can also reach our toll-free kisan helpline at <strong>1800-123-456</strong>.</p>

      <p style='margin-top:24px;'>Warm regards,<br/><strong>FarmerBandh Operations Team</strong><br/>Ahmedabad, Gujarat</p>
    </div>
    <div class='footer'>
      &copy; {{DateTime.UtcNow.Year}} FarmerBandh Platform Ltd. All rights reserved.
    </div>
  </div>
</body>
</html>
""";

        return await SendEmailAsync(message.Email, subject, html);
    }

    public async Task<bool> SendAdminReplyToUserAsync(ContactMessage message, string replyText)
    {
        var subject = $"Re: {message.Subject} — FarmerBandh Support Response";

        var html = $$"""
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fbf8; margin: 0; padding: 24px; color: #1f2937; }
    .card { background: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: #1B4D3E; padding: 24px; color: #ffffff; text-align: center; }
    .header h2 { margin: 0 0 6px 0; font-size: 22px; }
    .body { padding: 28px; line-height: 1.6; font-size: 15px; }
    .reply-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 6px; margin: 20px 0; font-size: 15px; color: #111827; white-space: pre-wrap; }
    .original-quote { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 16px; border-radius: 6px; font-size: 13.5px; color: #4b5563; margin-top: 24px; }
    .footer { background: #f9fafb; padding: 18px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h2>FarmerBandh Support Desk</h2>
      <p style='margin:0; color:#d1fae5; font-size:14px;'>Official Response to Your Inquiry</p>
    </div>
    <div class='body'>
      <p>Dear <strong>{{WebUtility.HtmlEncode(message.Name)}}</strong>,</p>
      <p>Thank you for your patience. Our administrative team has reviewed your query:</p>
      
      <div class='reply-box'>
        {{WebUtility.HtmlEncode(replyText)}}
      </div>

      <div class='original-quote'>
        <div style='font-size:12px; font-weight:700; color:#6b7280; margin-bottom:4px;'>YOUR ORIGINAL MESSAGE ({{message.Subject}}):</div>
        {{WebUtility.HtmlEncode(message.Message)}}
      </div>

      <p style='margin-top:24px;'>If you have further questions, feel free to reply directly to this email or call our toll-free kisan helpline at <strong>1800-123-456</strong>.</p>

      <p>Warm regards,<br/><strong>FarmerBandh Administration & Support Team</strong></p>
    </div>
    <div class='footer'>
      &copy; {{DateTime.UtcNow.Year}} FarmerBandh Platform Ltd. All rights reserved.
    </div>
  </div>
</body>
</html>
""";

        return await SendEmailAsync(message.Email, subject, html);
    }

    public async Task<bool> SendOrderConfirmationEmailAsync(Order order, string buyerEmail, string buyerName)
    {
        if (string.IsNullOrWhiteSpace(buyerEmail))
            return false;

        var subject = $"Order Confirmed: #{order.OrderNumber} — FarmerBandh Agrarian Marketplace";

        var itemsHtml = string.Empty;
        if (order.Items != null && order.Items.Any())
        {
            foreach (var it in order.Items)
            {
                itemsHtml += $"""
                <tr style='border-bottom: 1px solid #f1f5f9;'>
                  <td style='padding: 10px 0; font-weight: 600; color: #1e293b;'>{WebUtility.HtmlEncode(it.ProductNameSnapshot)}</td>
                  <td style='padding: 10px 0; text-align: center; color: #64748b;'>{it.QuantityQuintal} Qtl</td>
                  <td style='padding: 10px 0; text-align: right; color: #64748b;'>₹{it.UnitPricePerQuintal:N2}</td>
                  <td style='padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a;'>₹{it.LineTotal:N2}</td>
                </tr>
                """;
            }
        }
        else
        {
            itemsHtml = $"""
            <tr style='border-bottom: 1px solid #f1f5f9;'>
              <td colspan='4' style='padding: 10px 0; font-weight: 600; color: #1e293b;'>Agricultural Produce Order #{order.OrderNumber}</td>
            </tr>
            """;
        }

        var slotFormatted = $"{order.DeliverySlotDate:dd MMM yyyy} ({order.DeliverySlotWindow})";
        var addressFormatted = $"{order.DeliveryLine1}, {order.DeliveryCity}, {order.DeliveryState} - {order.DeliveryPincode}";

        var html = $$"""
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { background: #ffffff; max-width: 620px; margin: 0 auto; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #1B4D3E 0%, #064E3B 100%); padding: 32px 28px; color: #ffffff; text-align: center; }
    .header h2 { margin: 8px 0 0 0; font-size: 24px; font-weight: 800; }
    .header p { margin: 0; color: #a7f3d0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
    .body { padding: 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; margin-bottom: 18px; }
    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .table-container { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
    .table-container th { text-align: left; padding: 8px 0; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #475569; }
    .grand-total { display: flex; justify-content: space-between; padding: 12px 0 0 0; margin-top: 10px; border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: 800; color: #064e3b; }
    .escrow-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; margin-top: 24px; font-size: 13px; color: #166534; line-height: 1.5; }
    .footer { background: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <p>FarmerBandh Escrow Platform</p>
      <h2>Order Confirmed!</h2>
    </div>
    <div class='body'>
      <span class='badge'>✓ Payment & Escrow Secured</span>
      <p style='margin: 0 0 16px 0; font-size: 15px;'>Dear <strong>{{WebUtility.HtmlEncode(buyerName)}}</strong>,</p>
      <p style='margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;'>
        Thank you for choosing FarmerBandh. Your order has been registered and funds are securely held in Razorpay Escrow until successful delivery by our verified agricultural producer.
      </p>

      <div class='order-box'>
        <div style='display: flex; justify-content: space-between; margin-bottom: 8px;'>
          <span style='font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;'>Order Number</span>
          <span style='font-size: 13px; font-weight: 800; color: #0f172a;'>#{{order.OrderNumber}}</span>
        </div>
        <div style='display: flex; justify-content: space-between; margin-bottom: 8px;'>
          <span style='font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;'>Delivery Schedule</span>
          <span style='font-size: 13px; font-weight: 600; color: #0f172a;'>{{slotFormatted}}</span>
        </div>
        <div style='display: flex; justify-content: space-between;'>
          <span style='font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;'>Destination</span>
          <span style='font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; max-width: 60%;'>{{WebUtility.HtmlEncode(addressFormatted)}}</span>
        </div>
      </div>

      <table class='table-container'>
        <thead>
          <tr>
            <th>Item</th>
            <th style='text-align: center;'>Qty</th>
            <th style='text-align: right;'>Rate</th>
            <th style='text-align: right;'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {{itemsHtml}}
        </tbody>
      </table>

      <div style='background: #f8fafc; border-radius: 10px; padding: 14px 18px;'>
        <div class='total-row'>
          <span>Items Subtotal:</span>
          <span>₹{{order.Subtotal:N2}}</span>
        </div>
        {{(order.DiscountAmount > 0 ? $"<div class='total-row' style='color:#059669;'><span>Discount / Savings:</span><span>-₹{order.DiscountAmount:N2}</span></div>" : "")}}
        <div class='total-row'>
          <span>Delivery & Transport:</span>
          <span>₹{{order.DeliveryFee:N2}}</span>
        </div>
        <div class='total-row'>
          <span>Platform & Escrow Fee:</span>
          <span>₹{{order.PlatformFee:N2}}</span>
        </div>
        <div class='total-row'>
          <span>GST / Tax:</span>
          <span>₹{{order.TaxAmount:N2}}</span>
        </div>
        <div class='grand-total'>
          <span>Total Paid (INR):</span>
          <span>₹{{order.TotalAmount:N2}}</span>
        </div>
      </div>

      <div class='escrow-banner'>
        <strong>🛡️ Razorpay Escrow Guarantee:</strong> Payment is held safely in escrow. If there is any discrepancy in crop grade or delivery, our buyer dispute window protects 100% of your funds.
      </div>

      <p style='margin: 24px 0 6px 0; font-size: 13px; color: #64748b;'>
        Questions? Contact FarmerBandh Support at <strong>saurabhsinghdeveloper591@gmail.com</strong> or call <strong>1800-123-456</strong>.
      </p>
    </div>
    <div class='footer'>
      &copy; {{DateTime.UtcNow.Year}} FarmerBandh Platform Ltd. • Direct Agrarian Market Gateway
    </div>
  </div>
</body>
</html>
""";

        return await SendEmailAsync(buyerEmail, subject, html);
    }

    private string? GetConfigValue(string key)
    {
        // 1. Check live .env file first (guarantees up-to-date values without needing server restart)
        var dotEnvVal = ReadFromDotEnv(key);
        if (!string.IsNullOrWhiteSpace(dotEnvVal))
            return dotEnvVal;

        // 2. Check environment variable
        var envVal = Environment.GetEnvironmentVariable(key);
        if (!string.IsNullOrWhiteSpace(envVal))
            return envVal;

        // 3. Fallback to IConfiguration
        return _config[key];
    }

    private static string? ReadFromDotEnv(string key)
    {
        try
        {
            var searchDirs = new[]
            {
                Directory.GetCurrentDirectory(),
                Path.Combine(Directory.GetCurrentDirectory(), ".."),
                Path.Combine(Directory.GetCurrentDirectory(), "..", ".."),
                AppDomain.CurrentDomain.BaseDirectory
            };

            foreach (var dir in searchDirs)
            {
                var filePath = Path.Combine(dir, ".env");
                if (File.Exists(filePath))
                {
                    foreach (var line in File.ReadAllLines(filePath))
                    {
                        var trimmed = line.Trim();
                        if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#'))
                            continue;

                        var eqIdx = trimmed.IndexOf('=');
                        if (eqIdx > 0)
                        {
                            var currentKey = trimmed.Substring(0, eqIdx).Trim();
                            if (string.Equals(currentKey, key, StringComparison.OrdinalIgnoreCase))
                            {
                                return trimmed.Substring(eqIdx + 1).Trim().Trim('"', '\'');
                            }
                        }
                    }
                }
            }
        }
        catch
        {
            // Ignore file access issues
        }
        return null;
    }

    private static void TryAppendDebugLog(string message)
    {
        try
        {
            var logPath = Path.Combine(Directory.GetCurrentDirectory(), "smtp_debug.log");
            File.AppendAllText(logPath, $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] {message}\n");
        }
        catch
        {
            // Ignore logging errors
        }
    }
}
