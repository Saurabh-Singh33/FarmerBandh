using FarmerBandh.Application.DTOs.Contact;
using FarmerBandh.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerBandh.API.Controllers;

[ApiController]
[Route("api/v1/contact")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    /// <summary>
    /// Direct public contact submission to admin and operational team.
    /// Accessible by any visitor, farmer, buyer, or partner.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Submit([FromBody] CreateContactMessageDto dto)
    {
        if (dto == null)
            return BadRequest(new { message = "Invalid contact payload." });

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { message = "Full name, email address, and message are required." });

        try
        {
            var result = await _contactService.SubmitMessageAsync(dto);
            return StatusCode(201, new
            {
                message = "Your inquiry has been directly logged and dispatched to the Admin operations desk.",
                data = result
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while submitting your message. Please try again.", error = ex.Message });
        }
    }
}
