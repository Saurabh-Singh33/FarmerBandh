using System.Text.Json;
using System.Text.Json.Serialization;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.DTOs.Disputes;

public class CreateDisputeRequest
{
    public Guid? OrderId { get; set; }
    public string Subject { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public JsonElement? CategoryElement { get; set; }

    public string? InitialMessage { get; set; }
    public string? Description { get; set; }

    [JsonIgnore]
    public int Category
    {
        get => (int)ResolveCategory();
        set { }
    }

    [JsonIgnore]
    public string Message => !string.IsNullOrWhiteSpace(InitialMessage) ? InitialMessage : (Description ?? string.Empty);

    public DisputeCategory ResolveCategory()
    {
        if (CategoryElement.HasValue)
        {
            var elem = CategoryElement.Value;
            if (elem.ValueKind == JsonValueKind.Number && elem.TryGetInt32(out var intVal))
            {
                if (Enum.IsDefined(typeof(DisputeCategory), intVal))
                {
                    return (DisputeCategory)intVal;
                }
            }
            else if (elem.ValueKind == JsonValueKind.String)
            {
                var str = elem.GetString();
                if (!string.IsNullOrWhiteSpace(str))
                {
                    return MapCategoryString(str);
                }
            }
        }
        return DisputeCategory.Other;
    }

    private static DisputeCategory MapCategoryString(string str)
    {
        var clean = str.Replace(" ", "").Replace("/", "").ToLowerInvariant();
        if (clean.Contains("damaged")) return DisputeCategory.DamagedInTransit;
        if (clean.Contains("quality") || clean.Contains("moisture")) return DisputeCategory.QualityIssue;
        if (clean.Contains("nondelivery") || clean.Contains("notdelivered")) return DisputeCategory.NonDelivery;
        if (clean.Contains("delayed") || clean.Contains("late")) return DisputeCategory.DelayedDelivery;
        if (clean.Contains("payment") || clean.Contains("price") || clean.Contains("billing")) return DisputeCategory.PaymentDispute;
        if (clean.Contains("quantity") || clean.Contains("weight")) return DisputeCategory.QuantityMismatch;
        if (clean.Contains("behavior")) return DisputeCategory.BehaviorIssue;

        if (Enum.TryParse<DisputeCategory>(str, true, out var parsed))
        {
            return parsed;
        }

        return DisputeCategory.Other;
    }
}

public class PostDisputeMessageRequest
{
    public string Body { get; set; } = string.Empty;
    public string? Message { get; set; }

    [JsonIgnore]
    public string Content => !string.IsNullOrWhiteSpace(Body) ? Body : (Message ?? string.Empty);
}

public class ResolveDisputeRequest
{
    public string ResolutionNote { get; set; } = string.Empty;
    public string? ResolutionSummary { get; set; }

    [JsonIgnore]
    public string Note => !string.IsNullOrWhiteSpace(ResolutionNote) ? ResolutionNote : (ResolutionSummary ?? string.Empty);
}

public class UpdateDisputeStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? ResolutionSummary { get; set; }
    public string? ResolutionNote { get; set; }
}

public class DisputeMessageDto
{
    public Guid Id { get; set; }
    public Guid DisputeId { get; set; }
    public Guid SenderUserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderRole { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Message => Body;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DisputeDetailDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string DisputeNumber => $"DSP-{OpenedAt:yyyyMMdd}-{Id.ToString()[..6].ToUpper()}";
    public Guid RaisedByUserId { get; set; }
    public string RaisedByName { get; set; } = string.Empty;
    public string RaisedByRole { get; set; } = string.Empty;
    public Guid AgainstUserId { get; set; }
    public string AgainstByName { get; set; } = string.Empty;
    public string BuyerName => RaisedByRole == "Buyer" ? RaisedByName : AgainstByName;
    public string SellerName => RaisedByRole == "Farmer" ? RaisedByName : AgainstByName;
    public string Description => Messages.FirstOrDefault()?.Body ?? Subject;
    public string InitialMessage => Messages.FirstOrDefault()?.Body ?? Subject;
    public string Subject { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime OpenedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNote { get; set; }
    public string? ResolutionSummary => ResolutionNote;
    public List<DisputeMessageDto> Messages { get; set; } = new();
}

public class DisputeSummaryDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string DisputeNumber => $"DSP-{OpenedAt:yyyyMMdd}-{Id.ToString()[..6].ToUpper()}";
    public string RaisedByName { get; set; } = string.Empty;
    public string AgainstByName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime OpenedAt { get; set; }
}
