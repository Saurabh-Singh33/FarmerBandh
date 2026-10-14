using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.DTOs.Negotiations;

public class CreateNegotiationRequestDto
{
    public Guid ProductId { get; set; }
    public decimal OfferedPricePerQuintal { get; set; }
    public decimal InitialOfferPrice
    {
        get => OfferedPricePerQuintal;
        set => OfferedPricePerQuintal = value;
    }
    public decimal QuantityQuintal { get; set; }
    public string? Message { get; set; }
    public List<CreateNegotiationBundleItemDto>? Items { get; set; }
}

public class CreateNegotiationBundleItemDto
{
    public Guid ProductId { get; set; }
    public decimal QuantityQuintal { get; set; }
    public decimal OfferedPricePerQuintal { get; set; }
}

public class NegotiationBundleItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal QuantityQuintal { get; set; }
    public decimal InitialPricePerQuintal { get; set; }
    public decimal OfferedPricePerQuintal { get; set; }
    public decimal? AgreedPricePerQuintal { get; set; }
}

public class SendNegotiationMessageRequestDto
{
    public string MessageType { get; set; } = "Text"; // "Text" | "CounterOffer"
    public string Type
    {
        get => MessageType;
        set => MessageType = value;
    }

    public string? Body { get; set; }
    public string? Text
    {
        get => Body;
        set => Body = value;
    }

    public decimal? OfferPrice { get; set; }
    public decimal? ProposedPrice
    {
        get => OfferPrice;
        set => OfferPrice = value;
    }

    public decimal? QuantityQuintal { get; set; }
    public List<CreateNegotiationBundleItemDto>? BundleItems { get; set; }
}

public class AcceptNegotiationRequestDto
{
    public decimal? QuantityQuintal { get; set; }
}

public class RejectNegotiationRequestDto
{
    public string? Reason { get; set; }
}

public class NegotiationProductSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public decimal CurrentPricePerQuintal { get; set; }
    public string? ImageUrl { get; set; }
}

public class NegotiationFarmerSummaryDto
{
    public Guid Id { get; set; }
    public string FarmName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public decimal Rating { get; set; }
    public bool Verified { get; set; }
}

public class NegotiationBuyerSummaryDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string MaskedName { get; set; } = string.Empty;
}

public class NegotiationMessageDto
{
    public Guid Id { get; set; }
    public Guid NegotiationId { get; set; }
    public Guid SenderUserId { get; set; }
    public Guid AuthorUserId => SenderUserId;
    public string SenderRole { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string MessageType { get; set; } = string.Empty;
    public string? Body { get; set; }
    public decimal? OfferPrice { get; set; }
    public decimal? QuantityQuintal { get; set; }
    public List<NegotiationBundleItemDto>? BundleItems { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NegotiationSummaryDto
{
    public Guid Id { get; set; }
    public NegotiationProductSummaryDto Product { get; set; } = null!;
    public NegotiationFarmerSummaryDto Farmer { get; set; } = null!;
    public NegotiationBuyerSummaryDto Buyer { get; set; } = null!;
    public string Status { get; set; } = string.Empty;
    public decimal InitialPricePerQuintal { get; set; }
    public decimal CurrentOfferPrice { get; set; }
    public decimal? AgreedPricePerQuintal { get; set; }
    public decimal? QuantityQuintal { get; set; }
    public string CurrentOfferBy { get; set; } = string.Empty; // "Buyer" | "Farmer"
    public Guid CurrentOfferByUserId { get; set; }
    public decimal? LastCounterPrice { get; set; }
    public string? LastMessagePreview { get; set; }
    public int UnreadCount { get; set; }
    public DateTime LastMessageAt { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsBundle { get; set; }
    public List<NegotiationBundleItemDto> Items { get; set; } = new();

    // Convenience aliases
    public Guid ProductId => Product?.Id ?? Guid.Empty;
    public string ProductName => Product?.Name ?? string.Empty;
    public string? ProductImageUrl => Product?.ImageUrl;
    public Guid FarmerId => Farmer?.Id ?? Guid.Empty;
    public string FarmerFarmName => Farmer?.FarmName ?? string.Empty;
    public string BuyerName => Buyer?.FullName ?? string.Empty;
}

public class NegotiationHeaderDto
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public Guid FarmerId { get; set; }
    public Guid ProductId { get; set; }
    public decimal InitialPricePerQuintal { get; set; }
    public decimal CurrentOfferPrice { get; set; }
    public Guid CurrentOfferByUserId { get; set; }
    public string CurrentOfferByRole { get; set; } = string.Empty;
    public decimal? LastCounterPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? AgreedPricePerQuintal { get; set; }
    public decimal? QuantityQuintal { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime LastMessageAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }
    public string? RejectionReason { get; set; }
    public bool IsBundle { get; set; }
    public List<NegotiationBundleItemDto> Items { get; set; } = new();
}

public class NegotiationDetailDto
{
    public NegotiationHeaderDto Negotiation { get; set; } = null!;
    public List<NegotiationMessageDto> Messages { get; set; } = new();
    public NegotiationFarmerSummaryDto Farmer { get; set; } = null!;
    public NegotiationProductSummaryDto Product { get; set; } = null!;
    public NegotiationBuyerSummaryDto Buyer { get; set; } = null!;
    public int UnreadCount { get; set; }
    public bool CanAccept { get; set; }
    public bool CanReject { get; set; }
    public bool CanCounter { get; set; }
    public bool CanWithdraw { get; set; }

    // Top-level aliases for convenience and compatibility
    public Guid Id => Negotiation?.Id ?? Guid.Empty;
    public string Status => Negotiation?.Status ?? string.Empty;
    public decimal CurrentOfferPrice => Negotiation?.CurrentOfferPrice ?? 0;
    public decimal? AgreedPricePerQuintal => Negotiation?.AgreedPricePerQuintal;
    public decimal? QuantityQuintal => Negotiation?.QuantityQuintal;
    public decimal InitialPricePerQuintal => Negotiation?.InitialPricePerQuintal ?? 0;
    public Guid ProductId => Negotiation?.ProductId ?? Guid.Empty;
    public Guid FarmerId => Negotiation?.FarmerId ?? Guid.Empty;
    public Guid BuyerId => Negotiation?.BuyerId ?? Guid.Empty;
    public bool IsBundle => Negotiation?.IsBundle ?? false;
    public List<NegotiationBundleItemDto> Items => Negotiation?.Items ?? new();
}

public class UnreadCountDto
{
    public int Count { get; set; }
}
