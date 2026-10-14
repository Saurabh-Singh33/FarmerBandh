namespace FarmerBandh.Application.DTOs.Admin;

public class AdminDisputeQuery
{
    public string? Status { get; set; }
    public bool? Escalated { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AdminDisputeListItemDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string RaisedByName { get; set; } = string.Empty;
    public string AgainstName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AdminDisputeDetailDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ResolutionNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public AdminOrderParticipantDto RaisedBy { get; set; } = new();
    public AdminOrderParticipantDto Against { get; set; } = new();

    public List<AdminDisputeMessageDto> Messages { get; set; } = new();
}

public class AdminDisputeMessageDto
{
    public Guid Id { get; set; }
    public Guid SenderUserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderRole { get; set; } = string.Empty;
    public string MessageText { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminResolveDisputeRequest
{
    public string ResolutionNote { get; set; } = string.Empty;
    public string Favor { get; set; } = "neutral"; // "buyer" | "seller" | "neutral"
}

public class AdminPostDisputeMessageRequest
{
    public string Body { get; set; } = string.Empty;
}
