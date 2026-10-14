using FarmerBandh.Application.DTOs.Catalog;
using FarmerBandh.Application.DTOs.Disputes;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class DisputeService : IDisputeService
{
    private readonly IDisputeRepository _disputeRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;

    public DisputeService(
        IDisputeRepository disputeRepository,
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        IUserRepository userRepository,
        INotificationService notificationService)
    {
        _disputeRepository = disputeRepository;
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
    }

    public async Task<DisputeDetailDto> CreateDisputeAsync(Guid userId, Guid orderId, CreateDisputeRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User profile not found.");
        }

        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new KeyNotFoundException("Order not found.");
        }

        // Must be participant in order
        bool isBuyer = (order.Buyer != null && order.Buyer.UserId == userId) ||
                       (user.Buyer != null && order.BuyerId == user.Buyer.Id);
        bool isSeller = (order.Seller != null && order.Seller.UserId == userId) ||
                        (user.Farmer != null && order.SellerId == user.Farmer.Id);
        if (!isBuyer && !isSeller)
        {
            throw new UnauthorizedAccessException("Only participants of the order can raise a dispute.");
        }

        if (await _disputeRepository.HasOpenDisputeAsync(orderId))
        {
            throw new InvalidOperationException("An active dispute already exists for this order.");
        }

        Guid againstUserId = isBuyer
            ? (order.Seller?.UserId ?? Guid.Empty)
            : (order.Buyer?.UserId ?? Guid.Empty);

        if (againstUserId == Guid.Empty)
        {
            againstUserId = isBuyer ? (order.Seller?.UserId ?? userId) : (order.Buyer?.UserId ?? userId);
        }

        var category = request.ResolveCategory();

        var dispute = new Dispute
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            RaisedByUserId = userId,
            RaisedByRole = user.Role,
            AgainstUserId = againstUserId,
            Subject = request.Subject,
            Category = category,
            Status = DisputeStatus.Open,
            OpenedAt = DateTime.UtcNow
        };

        var initialMsg = request.Message;
        dispute.Messages.Add(new DisputeMessage
        {
            Id = Guid.NewGuid(),
            DisputeId = dispute.Id,
            SenderUserId = userId,
            SenderRole = user.Role,
            Body = initialMsg,
            CreatedAt = DateTime.UtcNow
        });

        await _disputeRepository.CreateAsync(dispute);

        dispute.Order = order;
        dispute.RaisedByUser = user;
        dispute.AgainstUser = isBuyer ? order.Seller?.User : order.Buyer?.User;

        // Notify the opposing party
        if (againstUserId != Guid.Empty)
        {
            var senderName = user.FullName;
            await _notificationService.CreateAsync(
                againstUserId,
                NotificationType.DISPUTE_OPENED,
                "Dispute opened",
                $"{senderName} raised a dispute on order #{order.OrderNumber}. Subject: {request.Subject}",
                isBuyer ? $"/seller/disputes/{dispute.Id}" : $"/disputes/{dispute.Id}",
                "Dispute",
                dispute.Id
            );
        }

        return MapToDetail(dispute);
    }

    public async Task<PagedResultDto<DisputeSummaryDto>> GetUserDisputesAsync(Guid userId, string? status, int page, int pageSize)
    {
        var (items, total) = await _disputeRepository.GetUserDisputesAsync(userId, status, page, pageSize);
        var dtos = items.Select(MapToSummary).ToList();

        return new PagedResultDto<DisputeSummaryDto>
        {
            Items = dtos,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<DisputeDetailDto> GetDisputeByIdAsync(Guid userId, Guid disputeId)
    {
        var dispute = await _disputeRepository.GetByIdAsync(disputeId);
        if (dispute == null || (dispute.RaisedByUserId != userId && dispute.AgainstUserId != userId))
        {
            throw new KeyNotFoundException("Dispute thread not found.");
        }

        return MapToDetail(dispute);
    }

    public async Task<DisputeDetailDto> AddMessageAsync(Guid userId, Guid disputeId, PostDisputeMessageRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        var dispute = await _disputeRepository.GetByIdAsync(disputeId);
        if (dispute == null || (dispute.RaisedByUserId != userId && dispute.AgainstUserId != userId))
        {
            throw new KeyNotFoundException("Dispute thread not found.");
        }

        if (dispute.Status == DisputeStatus.Closed)
        {
            throw new InvalidOperationException("Cannot add messages to a closed dispute.");
        }

        var message = new DisputeMessage
        {
            Id = Guid.NewGuid(),
            DisputeId = dispute.Id,
            SenderUserId = userId,
            SenderRole = user.Role,
            Body = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        // Automatic Status update: if sender is seller -> AwaitingBuyer, if sender is buyer -> AwaitingSeller
        if (user.Role == UserRole.Farmer)
        {
            dispute.Status = DisputeStatus.AwaitingBuyer;
        }
        else if (user.Role == UserRole.Buyer)
        {
            dispute.Status = DisputeStatus.AwaitingSeller;
        }

        await _disputeRepository.AddMessageAsync(message);
        await _disputeRepository.UpdateAsync(dispute);

        // Notify the other party of new dispute message
        var recipientUserId = dispute.RaisedByUserId == userId ? dispute.AgainstUserId : dispute.RaisedByUserId;
        if (recipientUserId != Guid.Empty)
        {
            await _notificationService.CreateAsync(
                recipientUserId,
                NotificationType.DISPUTE_MESSAGE,
                "New dispute message",
                $"New message from {user.FullName} on dispute #{dispute.Order?.OrderNumber ?? "order"}.",
                $"/disputes/{dispute.Id}",
                "Dispute",
                dispute.Id
            );
        }

        return MapToDetail(dispute);
    }

    public async Task<DisputeDetailDto> ResolveDisputeAsync(Guid userId, Guid disputeId, ResolveDisputeRequest request)
    {
        var dispute = await _disputeRepository.GetByIdAsync(disputeId);
        if (dispute == null || (dispute.RaisedByUserId != userId && dispute.AgainstUserId != userId))
        {
            throw new KeyNotFoundException("Dispute thread not found.");
        }

        dispute.Status = DisputeStatus.Resolved;
        dispute.ResolvedAt = DateTime.UtcNow;
        dispute.ResolutionNote = string.IsNullOrWhiteSpace(request.Note) ? "Resolved by mutual agreement" : request.Note;

        await _disputeRepository.UpdateAsync(dispute);

        // Notify both parties of resolution
        await _notificationService.CreateAsync(
            dispute.RaisedByUserId,
            NotificationType.DISPUTE_RESOLVED,
            "Dispute resolved",
            $"The dispute on order #{dispute.Order?.OrderNumber ?? "order"} has been resolved.",
            $"/disputes/{dispute.Id}",
            "Dispute",
            dispute.Id
        );

        await _notificationService.CreateAsync(
            dispute.AgainstUserId,
            NotificationType.DISPUTE_RESOLVED,
            "Dispute resolved",
            $"The dispute on order #{dispute.Order?.OrderNumber ?? "order"} has been resolved.",
            $"/disputes/{dispute.Id}",
            "Dispute",
            dispute.Id
        );

        return MapToDetail(dispute);
    }

    public async Task<DisputeDetailDto> CloseDisputeAsync(Guid userId, Guid disputeId)
    {
        var dispute = await _disputeRepository.GetByIdAsync(disputeId);
        if (dispute == null || (dispute.RaisedByUserId != userId && dispute.AgainstUserId != userId))
        {
            throw new KeyNotFoundException("Dispute thread not found.");
        }

        dispute.Status = DisputeStatus.Closed;
        await _disputeRepository.UpdateAsync(dispute);
        return MapToDetail(dispute);
    }

    private static DisputeDetailDto MapToDetail(Dispute d)
    {
        return new DisputeDetailDto
        {
            Id = d.Id,
            OrderId = d.OrderId,
            OrderNumber = d.Order?.OrderNumber ?? string.Empty,
            RaisedByUserId = d.RaisedByUserId,
            RaisedByName = d.RaisedByUser?.FullName ?? "User",
            RaisedByRole = d.RaisedByRole.ToString(),
            AgainstUserId = d.AgainstUserId,
            AgainstByName = d.AgainstUser?.FullName ?? "User",
            Subject = d.Subject,
            Category = d.Category.ToString(),
            Status = d.Status.ToString(),
            OpenedAt = d.OpenedAt,
            ResolvedAt = d.ResolvedAt,
            ResolutionNote = d.ResolutionNote,
            Messages = d.Messages
                .GroupBy(m => m.Id)
                .Select(g => g.First())
                .Select(m => new DisputeMessageDto
                {
                    Id = m.Id,
                    DisputeId = m.DisputeId,
                    SenderUserId = m.SenderUserId,
                    SenderName = m.SenderUser?.FullName ?? "User",
                    SenderRole = m.SenderRole.ToString(),
                    Body = m.Body,
                    AttachmentUrl = m.AttachmentUrl,
                    CreatedAt = m.CreatedAt
                }).OrderBy(m => m.CreatedAt).ToList()
        };
    }

    private static DisputeSummaryDto MapToSummary(Dispute d)
    {
        return new DisputeSummaryDto
        {
            Id = d.Id,
            OrderId = d.OrderId,
            OrderNumber = d.Order?.OrderNumber ?? string.Empty,
            RaisedByName = d.RaisedByUser?.FullName ?? "User",
            AgainstByName = d.AgainstUser?.FullName ?? "User",
            Subject = d.Subject,
            Category = d.Category.ToString(),
            Status = d.Status.ToString(),
            OpenedAt = d.OpenedAt
        };
    }
}
