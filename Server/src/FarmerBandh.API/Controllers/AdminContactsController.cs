using FarmerBandh.Application.DTOs.Contact;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[Route("api/v1/admin/contacts")]
public class AdminContactsController : AdminBaseController
{
    private readonly IContactService _contactService;

    public AdminContactsController(IContactService contactService)
    {
        _contactService = contactService;
    }

    /// <summary>
    /// Retrieve paginated contact inquiries submitted by users with status, role, and search filters.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMessages([FromQuery] ContactQueryParameters query)
    {
        var result = await _contactService.GetMessagesAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Retrieve single contact inquiry details.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _contactService.GetMessageByIdAsync(id);
        if (item == null)
            return NotFound(new { message = "Contact message not found." });

        return Ok(item);
    }

    /// <summary>
    /// Update status and administrative internal notes.
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateContactStatusDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
            return BadRequest(new { message = "Status is required." });

        var updated = await _contactService.UpdateStatusAsync(id, dto);
        if (updated == null)
            return NotFound(new { message = "Contact message not found." });

        return Ok(new { message = "Status updated successfully.", data = updated });
    }

    /// <summary>
    /// Direct email reply to the inquiry sender and marks the ticket as Replied.
    /// </summary>
    [HttpPost("{id:guid}/reply")]
    public async Task<IActionResult> Reply(Guid id, [FromBody] ReplyContactMessageDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.ReplyText))
            return BadRequest(new { message = "Reply text is required." });

        var adminUserId = GetAdminUserId();
        try
        {
            var updated = await _contactService.ReplyToMessageAsync(id, adminUserId, dto);
            if (updated == null)
                return NotFound(new { message = "Contact message not found." });

            return Ok(new { message = "Reply logged and sent to sender's email.", data = updated });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Remove a contact inquiry.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _contactService.DeleteMessageAsync(id);
        if (!deleted)
            return NotFound(new { message = "Contact message not found." });

        return Ok(new { message = "Contact inquiry deleted successfully." });
    }
}
