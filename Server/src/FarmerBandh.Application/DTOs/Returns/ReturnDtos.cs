using FarmerBandh.Application.DTOs.Refunds;

namespace FarmerBandh.Application.DTOs.Returns;

public class CreateReturnItemDto
{
    public Guid OrderItemId { get; set; }
    public decimal QuantityQuintal { get; set; }
    public string? Reason { get; set; }
}

public class CreateReturnRequest
{
    public Guid OrderId { get; set; }
    public int ReasonCategory { get; set; }
    public string? Category { get; set; }
    public string Reason { get; set; } = string.Empty;
    public List<CreateReturnItemDto> Items { get; set; } = new();
}

public class ReturnItemDto
{
    public Guid Id { get; set; }
    public Guid OrderItemId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public decimal QuantityQuintal { get; set; }
    public decimal UnitPricePerQuintal { get; set; }
    public string? Reason { get; set; }
}

public class ReturnMessageDto
{
    public Guid Id { get; set; }
    public Guid ReturnRequestId { get; set; }
    public Guid SenderUserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderRole { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PostReturnMessageRequest
{
    public string Body { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
}

public class ReturnDetailDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid BuyerId { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string ReasonCategory { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? SellerResponse { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal RefundAmount { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public List<ReturnItemDto> Items { get; set; } = new();
    public List<ReturnMessageDto> Messages { get; set; } = new();
    public RefundDto? Refund { get; set; }
}

public class ReturnSummaryDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string BuyerName { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string ReasonCategory { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? SellerResponse { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime RequestedAt { get; set; }
}

public class ApproveReturnRequest
{
    public string? SellerResponse { get; set; }
}

public class RejectReturnRequest
{
    public string SellerResponse { get; set; } = string.Empty;
}

public class UpdateReturnStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? SellerNote { get; set; }
}
