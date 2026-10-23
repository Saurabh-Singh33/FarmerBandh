namespace FarmerBandh.Application.DTOs.Contact;

public class CreateContactMessageDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string UserType { get; set; } = "general";
    public string Subject { get; set; } = "General";
    public string Message { get; set; } = string.Empty;
}

public class ContactMessageResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string UserType { get; set; } = "general";
    public string Subject { get; set; } = "General";
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? AdminNotes { get; set; }
    public string? AdminReplyText { get; set; }
    public DateTime? RepliedAt { get; set; }
    public Guid? RepliedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateContactStatusDto
{
    public string Status { get; set; } = "Pending";
    public string? AdminNotes { get; set; }
}

public class ReplyContactMessageDto
{
    public string ReplyText { get; set; } = string.Empty;
    public string? AdminNotes { get; set; }
}

public class ContactQueryParameters
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? UserType { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
