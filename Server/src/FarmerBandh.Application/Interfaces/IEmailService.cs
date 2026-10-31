using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Interfaces;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody, string? replyTo = null);
    Task<bool> SendContactInquiryAdminAlertAsync(ContactMessage message);
    Task<bool> SendContactInquiryAcknowledgmentAsync(ContactMessage message);
    Task<bool> SendAdminReplyToUserAsync(ContactMessage message, string replyText);
    Task<bool> SendOrderConfirmationEmailAsync(Order order, string buyerEmail, string buyerName);
}
