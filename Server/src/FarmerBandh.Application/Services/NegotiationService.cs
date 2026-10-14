using System.Text.Json;
using FarmerBandh.Application.DTOs.Negotiations;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;

namespace FarmerBandh.Application.Services;

public class NegotiationService : INegotiationService
{
    private readonly INegotiationRepository _negotiationRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFarmerRepository _farmerRepository;

    public NegotiationService(
        INegotiationRepository negotiationRepository,
        IProductRepository productRepository,
        IUserRepository userRepository,
        IFarmerRepository farmerRepository)
    {
        _negotiationRepository = negotiationRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
        _farmerRepository = farmerRepository;
    }

    public async Task<NegotiationDetailDto> StartNegotiationAsync(Guid buyerUserId, CreateNegotiationRequestDto request)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null)
            throw new KeyNotFoundException("Buyer profile not found.");

        var isBundle = request.Items != null && request.Items.Count > 1;

        if (isBundle)
        {
            var bundleList = new List<NegotiationBundleItemDto>();
            Guid? farmerId = null;
            decimal totalQty = 0;
            decimal totalInitial = 0;
            decimal totalOffered = 0;
            Product? primaryProduct = null;

            foreach (var itemReq in request.Items!)
            {
                var prod = await _productRepository.GetByIdAsync(itemReq.ProductId);
                if (prod == null || prod.Status != ProductStatus.Active)
                    throw new KeyNotFoundException($"Product '{itemReq.ProductId}' is not active or available.");

                if (prod.Farmer == null)
                    throw new InvalidOperationException($"Farmer details not found for product '{prod.Name}'.");

                if (farmerId == null)
                {
                    farmerId = prod.FarmerId;
                    primaryProduct = prod;
                }
                else if (farmerId.Value != prod.FarmerId)
                {
                    throw new InvalidOperationException("Bundle negotiation can only contain products from the same farmer.");
                }

                if (buyer.UserId == prod.Farmer.UserId)
                    throw new InvalidOperationException("You cannot negotiate with your own listing.");

                if (itemReq.OfferedPricePerQuintal <= 0 || itemReq.OfferedPricePerQuintal > prod.PricePerQuintal)
                    throw new InvalidOperationException($"Offered price for '{prod.Name}' must be between ₹1 and list price ₹{prod.PricePerQuintal}.");

                if (itemReq.QuantityQuintal <= 0 || itemReq.QuantityQuintal > prod.AvailableQuantityQuintal)
                    throw new InvalidOperationException($"Quantity for '{prod.Name}' must be between 1 and {prod.AvailableQuantityQuintal} quintals.");

                totalQty += itemReq.QuantityQuintal;
                totalInitial += prod.PricePerQuintal * itemReq.QuantityQuintal;
                totalOffered += itemReq.OfferedPricePerQuintal * itemReq.QuantityQuintal;

                bundleList.Add(new NegotiationBundleItemDto
                {
                    ProductId = prod.Id,
                    ProductName = prod.Name,
                    ImageUrl = prod.ImageUrl,
                    QuantityQuintal = itemReq.QuantityQuintal,
                    InitialPricePerQuintal = prod.PricePerQuintal,
                    OfferedPricePerQuintal = itemReq.OfferedPricePerQuintal
                });
            }

            var now = DateTime.UtcNow;
            var bundleJson = JsonSerializer.Serialize(bundleList);
            var avgInitial = totalQty > 0 ? (totalInitial / totalQty) : 0;
            var avgOffered = totalQty > 0 ? (totalOffered / totalQty) : 0;

            var negotiation = new Negotiation
            {
                BuyerId = buyer.Id,
                FarmerId = farmerId!.Value,
                ProductId = primaryProduct!.Id,
                InitialPricePerQuintal = avgInitial,
                CurrentOfferPrice = avgOffered,
                QuantityQuintal = totalQty,
                IsBundle = true,
                BundleItemsJson = bundleJson,
                CurrentOfferByUserId = buyerUserId,
                CurrentOfferByRole = UserRole.Buyer,
                LastCounterPrice = null,
                Status = NegotiationStatus.Open,
                OpenedAt = now,
                LastMessageAt = now,
                ExpiresAt = now.AddHours(48)
            };

            await _negotiationRepository.AddAsync(negotiation);

            var firstMessage = new NegotiationMessage
            {
                NegotiationId = negotiation.Id,
                SenderUserId = buyerUserId,
                SenderRole = UserRole.Buyer,
                MessageType = NegotiationMessageType.Offer,
                Body = request.Message ?? $"Bundle offer for {bundleList.Count} items ({totalQty} quintals total) at ₹{totalOffered:N0} total.",
                OfferPrice = avgOffered,
                QuantityQuintal = totalQty,
                BundleItemsJson = bundleJson,
                IsRead = false,
                CreatedAt = now
            };

            await _negotiationRepository.AddMessageAsync(firstMessage);
            await _negotiationRepository.SaveChangesAsync();

            return await GetBuyerNegotiationDetailAsync(buyerUserId, negotiation.Id);
        }

        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product == null)
            throw new KeyNotFoundException("Product not found.");

        if (product.Status != ProductStatus.Active)
            throw new InvalidOperationException("Product is not active for negotiation.");

        if (product.Farmer == null)
            throw new InvalidOperationException("Farmer details not found for this product.");

        if (buyer.UserId == product.Farmer.UserId)
            throw new InvalidOperationException("You cannot negotiate with your own listing.");

        if (request.OfferedPricePerQuintal <= 0 || request.OfferedPricePerQuintal > product.PricePerQuintal)
            throw new InvalidOperationException($"Offered price must be greater than zero and cannot exceed list price of ₹{product.PricePerQuintal}.");

        if (request.QuantityQuintal < product.MinOrderQuantityQuintal || request.QuantityQuintal > product.AvailableQuantityQuintal)
            throw new InvalidOperationException($"Quantity must be between {product.MinOrderQuantityQuintal} and {product.AvailableQuantityQuintal} quintals.");

        var existing = await _negotiationRepository.GetActiveNegotiationAsync(buyer.Id, product.FarmerId, product.Id);
        if (existing != null)
            return await GetBuyerNegotiationDetailAsync(buyerUserId, existing.Id);

        var singleNow = DateTime.UtcNow;
        var singleNegotiation = new Negotiation
        {
            BuyerId = buyer.Id,
            FarmerId = product.FarmerId,
            ProductId = product.Id,
            InitialPricePerQuintal = product.PricePerQuintal,
            CurrentOfferPrice = request.OfferedPricePerQuintal,
            QuantityQuintal = request.QuantityQuintal,
            CurrentOfferByUserId = buyerUserId,
            CurrentOfferByRole = UserRole.Buyer,
            LastCounterPrice = null,
            Status = NegotiationStatus.Open,
            OpenedAt = singleNow,
            LastMessageAt = singleNow,
            ExpiresAt = singleNow.AddHours(48)
        };

        await _negotiationRepository.AddAsync(singleNegotiation);

        var singleFirstMessage = new NegotiationMessage
        {
            NegotiationId = singleNegotiation.Id,
            SenderUserId = buyerUserId,
            SenderRole = UserRole.Buyer,
            MessageType = NegotiationMessageType.Offer,
            Body = request.Message,
            OfferPrice = request.OfferedPricePerQuintal,
            QuantityQuintal = request.QuantityQuintal,
            IsRead = false,
            CreatedAt = singleNow
        };

        await _negotiationRepository.AddMessageAsync(singleFirstMessage);
        await _negotiationRepository.SaveChangesAsync();

        return await GetBuyerNegotiationDetailAsync(buyerUserId, singleNegotiation.Id);
    }

    public async Task<IEnumerable<NegotiationSummaryDto>> GetBuyerNegotiationsAsync(Guid buyerUserId, string? status = null, string? search = null)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) return Enumerable.Empty<NegotiationSummaryDto>();

        NegotiationStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<NegotiationStatus>(status, true, out var parsed))
        {
            statusFilter = parsed;
        }

        var list = await _negotiationRepository.GetBuyerNegotiationsAsync(buyer.Id, statusFilter, search);
        return list.Select(n => MapToSummary(n, buyerUserId, isBuyer: true));
    }

    public async Task<NegotiationDetailDto> GetBuyerNegotiationDetailAsync(Guid buyerUserId, Guid negotiationId)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) throw new UnauthorizedAccessException("Buyer profile not found.");

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.BuyerId != buyer.Id)
            throw new UnauthorizedAccessException("You are not authorized to view this negotiation.");

        // Mark farmer's messages as read
        await _negotiationRepository.MarkMessagesAsReadAsync(negotiationId, buyerUserId);
        await _negotiationRepository.SaveChangesAsync();

        return MapToDetail(negotiation, buyerUserId, isBuyer: true);
    }

    public async Task<NegotiationDetailDto> BuyerSendMessageAsync(Guid buyerUserId, Guid negotiationId, SendNegotiationMessageRequestDto request)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) throw new UnauthorizedAccessException();

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.BuyerId != buyer.Id)
            throw new UnauthorizedAccessException("You are not authorized to participate in this negotiation.");

        if (negotiation.Status == NegotiationStatus.Rejected || negotiation.Status == NegotiationStatus.Expired || negotiation.Status == NegotiationStatus.Withdrawn)
            throw new InvalidOperationException("Negotiation is closed. No further messages can be sent.");

        var now = DateTime.UtcNow;
        var isCounter = string.Equals(request.MessageType, "CounterOffer", StringComparison.OrdinalIgnoreCase);

        if (isCounter)
        {
            if (negotiation.Status != NegotiationStatus.Open && negotiation.Status != NegotiationStatus.Countered)
                throw new InvalidOperationException("This deal has already been finalized. Further counter-offers cannot be proposed.");

            if (negotiation.CurrentOfferByRole == UserRole.Buyer)
                throw new InvalidOperationException("You cannot counter your own offer. Please wait for the farmer's response.");

            if (!request.OfferPrice.HasValue || request.OfferPrice.Value <= 0 || request.OfferPrice.Value > negotiation.InitialPricePerQuintal)
                throw new InvalidOperationException($"Counter-offer price must be between ₹1 and ₹{negotiation.InitialPricePerQuintal}.");

            if (negotiation.IsBundle && request.BundleItems != null && request.BundleItems.Count > 0)
            {
                var bundleList = ParseBundleItems(negotiation.BundleItemsJson);
                decimal newTotalOffered = 0;
                decimal totalQty = 0;
                foreach (var itemReq in request.BundleItems)
                {
                    var b = bundleList.FirstOrDefault(x => x.ProductId == itemReq.ProductId);
                    if (b != null)
                    {
                        b.OfferedPricePerQuintal = itemReq.OfferedPricePerQuintal;
                        if (itemReq.QuantityQuintal > 0) b.QuantityQuintal = itemReq.QuantityQuintal;
                    }
                }
                foreach (var b in bundleList)
                {
                    newTotalOffered += b.OfferedPricePerQuintal * b.QuantityQuintal;
                    totalQty += b.QuantityQuintal;
                }
                var avgPrice = totalQty > 0 ? (newTotalOffered / totalQty) : (request.OfferPrice ?? negotiation.CurrentOfferPrice);
                negotiation.BundleItemsJson = JsonSerializer.Serialize(bundleList);
                negotiation.LastCounterPrice = negotiation.CurrentOfferPrice;
                negotiation.CurrentOfferPrice = avgPrice;
            }
            else if (negotiation.IsBundle && !string.IsNullOrWhiteSpace(negotiation.BundleItemsJson))
            {
                var bundleList = ParseBundleItems(negotiation.BundleItemsJson);
                var ratio = negotiation.CurrentOfferPrice > 0 ? (request.OfferPrice!.Value / negotiation.CurrentOfferPrice) : 1m;
                foreach (var b in bundleList)
                {
                    b.OfferedPricePerQuintal = Math.Round(b.OfferedPricePerQuintal * ratio, 2);
                }
                negotiation.BundleItemsJson = JsonSerializer.Serialize(bundleList);
                negotiation.LastCounterPrice = negotiation.CurrentOfferPrice;
                negotiation.CurrentOfferPrice = request.OfferPrice!.Value;
            }
            else
            {
                negotiation.LastCounterPrice = negotiation.CurrentOfferPrice;
                negotiation.CurrentOfferPrice = request.OfferPrice!.Value;
            }


            negotiation.CurrentOfferByUserId = buyerUserId;
            negotiation.CurrentOfferByRole = UserRole.Buyer;
            negotiation.Status = NegotiationStatus.Countered;
            negotiation.LastMessageAt = now;

            var msg = new NegotiationMessage
            {
                NegotiationId = negotiation.Id,
                SenderUserId = buyerUserId,
                SenderRole = UserRole.Buyer,
                MessageType = NegotiationMessageType.CounterOffer,
                Body = request.Body,
                OfferPrice = negotiation.CurrentOfferPrice,
                QuantityQuintal = request.QuantityQuintal ?? negotiation.QuantityQuintal,
                BundleItemsJson = negotiation.BundleItemsJson,
                IsRead = false,
                CreatedAt = now
            };
            await _negotiationRepository.AddMessageAsync(msg);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.Body))
                throw new InvalidOperationException("Message body is required.");

            negotiation.LastMessageAt = now;

            var msg = new NegotiationMessage
            {
                NegotiationId = negotiation.Id,
                SenderUserId = buyerUserId,
                SenderRole = UserRole.Buyer,
                MessageType = NegotiationMessageType.Text,
                Body = request.Body,
                BundleItemsJson = negotiation.BundleItemsJson,
                IsRead = false,
                CreatedAt = now
            };
            await _negotiationRepository.AddMessageAsync(msg);
        }

        await _negotiationRepository.UpdateAsync(negotiation);
        await _negotiationRepository.SaveChangesAsync();

        return await GetBuyerNegotiationDetailAsync(buyerUserId, negotiationId);
    }

    public async Task<NegotiationDetailDto> BuyerAcceptAsync(Guid buyerUserId, Guid negotiationId, AcceptNegotiationRequestDto? request = null)
    {
        request ??= new AcceptNegotiationRequestDto();

        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) throw new UnauthorizedAccessException();

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.BuyerId != buyer.Id)
            throw new UnauthorizedAccessException();

        if (negotiation.Status != NegotiationStatus.Open && negotiation.Status != NegotiationStatus.Countered)
            throw new InvalidOperationException("Negotiation is not open.");

        if (negotiation.CurrentOfferByRole != UserRole.Farmer)
            throw new InvalidOperationException("You cannot accept your own offer.");

        var finalQuantity = (request.QuantityQuintal.HasValue && request.QuantityQuintal.Value > 0)
            ? request.QuantityQuintal.Value
            : negotiation.QuantityQuintal;

        var now = DateTime.UtcNow;
        negotiation.Status = NegotiationStatus.Accepted;
        negotiation.AgreedPricePerQuintal = negotiation.CurrentOfferPrice;
        negotiation.QuantityQuintal = finalQuantity;
        negotiation.AcceptedAt = now;
        negotiation.LastMessageAt = now;

        if (negotiation.IsBundle && !string.IsNullOrWhiteSpace(negotiation.BundleItemsJson))
        {
            var bundleList = ParseBundleItems(negotiation.BundleItemsJson);
            foreach (var b in bundleList)
            {
                if (!b.AgreedPricePerQuintal.HasValue)
                    b.AgreedPricePerQuintal = b.OfferedPricePerQuintal;
            }
            negotiation.BundleItemsJson = JsonSerializer.Serialize(bundleList);
        }

        var msg = new NegotiationMessage
        {
            NegotiationId = negotiation.Id,
            SenderUserId = buyerUserId,
            SenderRole = UserRole.Buyer,
            MessageType = NegotiationMessageType.Accept,
            Body = negotiation.IsBundle
                ? $"Buyer accepted the bundle deal agreed at ₹{negotiation.CurrentOfferPrice:N0}/quintal average."
                : $"Buyer accepted the agreed price of ₹{negotiation.CurrentOfferPrice}/quintal.",
            OfferPrice = negotiation.CurrentOfferPrice,
            QuantityQuintal = finalQuantity,
            BundleItemsJson = negotiation.BundleItemsJson,
            IsRead = false,
            CreatedAt = now
        };

        await _negotiationRepository.AddMessageAsync(msg);
        await _negotiationRepository.UpdateAsync(negotiation);
        await _negotiationRepository.SaveChangesAsync();

        return await GetBuyerNegotiationDetailAsync(buyerUserId, negotiationId);
    }

    public async Task<NegotiationDetailDto> BuyerRejectAsync(Guid buyerUserId, Guid negotiationId, RejectNegotiationRequestDto? request = null)
    {
        request ??= new RejectNegotiationRequestDto();

        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) throw new UnauthorizedAccessException();

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.BuyerId != buyer.Id)
            throw new UnauthorizedAccessException();

        if (negotiation.Status != NegotiationStatus.Open && negotiation.Status != NegotiationStatus.Countered)
            throw new InvalidOperationException("Negotiation is not open.");

        if (negotiation.CurrentOfferByRole != UserRole.Farmer)
            throw new InvalidOperationException("You cannot reject your own offer.");

        var now = DateTime.UtcNow;
        negotiation.Status = NegotiationStatus.Rejected;
        negotiation.RejectedAt = now;
        negotiation.RejectionReason = request.Reason;
        negotiation.LastMessageAt = now;

        var msg = new NegotiationMessage
        {
            NegotiationId = negotiation.Id,
            SenderUserId = buyerUserId,
            SenderRole = UserRole.Buyer,
            MessageType = NegotiationMessageType.Reject,
            Body = !string.IsNullOrWhiteSpace(request.Reason) ? request.Reason : "Buyer rejected the offer.",
            IsRead = false,
            CreatedAt = now
        };

        await _negotiationRepository.AddMessageAsync(msg);
        await _negotiationRepository.UpdateAsync(negotiation);
        await _negotiationRepository.SaveChangesAsync();

        return await GetBuyerNegotiationDetailAsync(buyerUserId, negotiationId);
    }

    public async Task<NegotiationDetailDto> BuyerWithdrawAsync(Guid buyerUserId, Guid negotiationId)
    {
        var buyer = await _userRepository.GetBuyerByUserIdAsync(buyerUserId);
        if (buyer == null) throw new UnauthorizedAccessException();

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.BuyerId != buyer.Id)
            throw new UnauthorizedAccessException();

        if (negotiation.Status != NegotiationStatus.Open && negotiation.Status != NegotiationStatus.Countered)
            throw new InvalidOperationException("Negotiation is not open.");

        if (negotiation.CurrentOfferByRole != UserRole.Buyer)
            throw new InvalidOperationException("You can only withdraw an offer you made.");

        var now = DateTime.UtcNow;
        negotiation.Status = NegotiationStatus.Withdrawn;
        negotiation.WithdrawnAt = now;
        negotiation.LastMessageAt = now;

        var msg = new NegotiationMessage
        {
            NegotiationId = negotiation.Id,
            SenderUserId = buyerUserId,
            SenderRole = UserRole.Buyer,
            MessageType = NegotiationMessageType.System,
            Body = "Buyer withdrew the offer.",
            IsRead = false,
            CreatedAt = now
        };

        await _negotiationRepository.AddMessageAsync(msg);
        await _negotiationRepository.UpdateAsync(negotiation);
        await _negotiationRepository.SaveChangesAsync();

        return await GetBuyerNegotiationDetailAsync(buyerUserId, negotiationId);
    }

    // Seller operations
    public async Task<IEnumerable<NegotiationSummaryDto>> GetSellerNegotiationsAsync(Guid farmerUserId, string? status = null, string? search = null)
    {
        var farmer = await _farmerRepository.GetByUserIdAsync(farmerUserId);
        if (farmer == null) return Enumerable.Empty<NegotiationSummaryDto>();

        NegotiationStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<NegotiationStatus>(status, true, out var parsed))
        {
            statusFilter = parsed;
        }

        var list = await _negotiationRepository.GetSellerNegotiationsAsync(farmer.Id, statusFilter, search);
        return list.Select(n => MapToSummary(n, farmerUserId, isBuyer: false));
    }

    public async Task<NegotiationDetailDto> GetSellerNegotiationDetailAsync(Guid farmerUserId, Guid negotiationId)
    {
        var farmer = await _farmerRepository.GetByUserIdAsync(farmerUserId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.FarmerId != farmer.Id)
            throw new UnauthorizedAccessException("You are not authorized to view this negotiation.");

        // Mark buyer's messages as read
        await _negotiationRepository.MarkMessagesAsReadAsync(negotiationId, farmerUserId);
        await _negotiationRepository.SaveChangesAsync();

        return MapToDetail(negotiation, farmerUserId, isBuyer: false);
    }

    public async Task<NegotiationDetailDto> SellerSendMessageAsync(Guid farmerUserId, Guid negotiationId, SendNegotiationMessageRequestDto request)
    {
        var farmer = await _farmerRepository.GetByUserIdAsync(farmerUserId);
        if (farmer == null) throw new UnauthorizedAccessException();

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.FarmerId != farmer.Id)
            throw new UnauthorizedAccessException("You are not authorized to participate in this negotiation.");

        if (negotiation.Status == NegotiationStatus.Rejected || negotiation.Status == NegotiationStatus.Expired || negotiation.Status == NegotiationStatus.Withdrawn)
            throw new InvalidOperationException("Negotiation is closed. No further messages can be sent.");

        var now = DateTime.UtcNow;
        var isCounter = string.Equals(request.MessageType, "CounterOffer", StringComparison.OrdinalIgnoreCase);

        if (isCounter)
        {
            if (negotiation.Status != NegotiationStatus.Open && negotiation.Status != NegotiationStatus.Countered)
                throw new InvalidOperationException("This deal has already been finalized. Further counter-offers cannot be proposed.");

            if (negotiation.CurrentOfferByRole == UserRole.Farmer)
                throw new InvalidOperationException("You cannot counter your own offer. Please wait for the buyer's response.");

            if (!request.OfferPrice.HasValue || request.OfferPrice.Value <= 0 || request.OfferPrice.Value > negotiation.InitialPricePerQuintal)
                throw new InvalidOperationException($"Counter-offer price must be between ₹1 and ₹{negotiation.InitialPricePerQuintal}.");

            if (negotiation.IsBundle && request.BundleItems != null && request.BundleItems.Count > 0)
            {
                var bundleList = ParseBundleItems(negotiation.BundleItemsJson);
                decimal newTotalOffered = 0;
                decimal totalQty = 0;
                foreach (var itemReq in request.BundleItems)
                {
                    var b = bundleList.FirstOrDefault(x => x.ProductId == itemReq.ProductId);
                    if (b != null)
                    {
                        b.OfferedPricePerQuintal = itemReq.OfferedPricePerQuintal;
                        if (itemReq.QuantityQuintal > 0) b.QuantityQuintal = itemReq.QuantityQuintal;
                    }
                }
                foreach (var b in bundleList)
                {
                    newTotalOffered += b.OfferedPricePerQuintal * b.QuantityQuintal;
                    totalQty += b.QuantityQuintal;
                }
                var avgPrice = totalQty > 0 ? (newTotalOffered / totalQty) : (request.OfferPrice ?? negotiation.CurrentOfferPrice);
                negotiation.BundleItemsJson = JsonSerializer.Serialize(bundleList);
                negotiation.LastCounterPrice = negotiation.CurrentOfferPrice;
                negotiation.CurrentOfferPrice = avgPrice;
            }
            else if (negotiation.IsBundle && !string.IsNullOrWhiteSpace(negotiation.BundleItemsJson))
            {
                var bundleList = ParseBundleItems(negotiation.BundleItemsJson);
                var ratio = negotiation.CurrentOfferPrice > 0 ? (request.OfferPrice!.Value / negotiation.CurrentOfferPrice) : 1m;
                foreach (var b in bundleList)
                {
                    b.OfferedPricePerQuintal = Math.Round(b.OfferedPricePerQuintal * ratio, 2);
                }
                negotiation.BundleItemsJson = JsonSerializer.Serialize(bundleList);
                negotiation.LastCounterPrice = negotiation.CurrentOfferPrice;
                negotiation.CurrentOfferPrice = request.OfferPrice!.Value;
            }
            else
            {
                negotiation.LastCounterPrice = negotiation.CurrentOfferPrice;
                negotiation.CurrentOfferPrice = request.OfferPrice!.Value;
            }


            negotiation.CurrentOfferByUserId = farmerUserId;
            negotiation.CurrentOfferByRole = UserRole.Farmer;
            negotiation.Status = NegotiationStatus.Countered;
            negotiation.LastMessageAt = now;

            var msg = new NegotiationMessage
            {
                NegotiationId = negotiation.Id,
                SenderUserId = farmerUserId,
                SenderRole = UserRole.Farmer,
                MessageType = NegotiationMessageType.CounterOffer,
                Body = request.Body,
                OfferPrice = negotiation.CurrentOfferPrice,
                QuantityQuintal = request.QuantityQuintal ?? negotiation.QuantityQuintal,
                BundleItemsJson = negotiation.BundleItemsJson,
                IsRead = false,
                CreatedAt = now
            };
            await _negotiationRepository.AddMessageAsync(msg);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.Body))
                throw new InvalidOperationException("Message body is required.");

            negotiation.LastMessageAt = now;

            var msg = new NegotiationMessage
            {
                NegotiationId = negotiation.Id,
                SenderUserId = farmerUserId,
                SenderRole = UserRole.Farmer,
                MessageType = NegotiationMessageType.Text,
                Body = request.Body,
                BundleItemsJson = negotiation.BundleItemsJson,
                IsRead = false,
                CreatedAt = now
            };
            await _negotiationRepository.AddMessageAsync(msg);
        }

        await _negotiationRepository.UpdateAsync(negotiation);
        await _negotiationRepository.SaveChangesAsync();

        return await GetSellerNegotiationDetailAsync(farmerUserId, negotiationId);
    }

    public async Task<NegotiationDetailDto> SellerAcceptAsync(Guid farmerUserId, Guid negotiationId, AcceptNegotiationRequestDto? request = null)
    {
        request ??= new AcceptNegotiationRequestDto();

        var farmer = await _farmerRepository.GetByUserIdAsync(farmerUserId);
        if (farmer == null) throw new UnauthorizedAccessException();

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.FarmerId != farmer.Id)
            throw new UnauthorizedAccessException();

        if (negotiation.Status != NegotiationStatus.Open && negotiation.Status != NegotiationStatus.Countered)
            throw new InvalidOperationException("Negotiation is not open.");

        if (negotiation.CurrentOfferByRole != UserRole.Buyer)
            throw new InvalidOperationException("You cannot accept your own offer.");

        var finalQuantity = (request.QuantityQuintal.HasValue && request.QuantityQuintal.Value > 0)
            ? request.QuantityQuintal.Value
            : negotiation.QuantityQuintal;

        var now = DateTime.UtcNow;
        negotiation.Status = NegotiationStatus.Accepted;
        negotiation.AgreedPricePerQuintal = negotiation.CurrentOfferPrice;
        negotiation.QuantityQuintal = finalQuantity;
        negotiation.AcceptedAt = now;
        negotiation.LastMessageAt = now;

        if (negotiation.IsBundle && !string.IsNullOrWhiteSpace(negotiation.BundleItemsJson))
        {
            var bundleList = ParseBundleItems(negotiation.BundleItemsJson);
            foreach (var b in bundleList)
            {
                if (!b.AgreedPricePerQuintal.HasValue)
                    b.AgreedPricePerQuintal = b.OfferedPricePerQuintal;
            }
            negotiation.BundleItemsJson = JsonSerializer.Serialize(bundleList);
        }

        var msg = new NegotiationMessage
        {
            NegotiationId = negotiation.Id,
            SenderUserId = farmerUserId,
            SenderRole = UserRole.Farmer,
            MessageType = NegotiationMessageType.Accept,
            Body = negotiation.IsBundle
                ? $"Farmer accepted the bundle deal agreed at ₹{negotiation.CurrentOfferPrice:N0}/quintal average."
                : $"Farmer accepted the buyer's offer of ₹{negotiation.CurrentOfferPrice}/quintal.",
            OfferPrice = negotiation.CurrentOfferPrice,
            QuantityQuintal = finalQuantity,
            BundleItemsJson = negotiation.BundleItemsJson,
            IsRead = false,
            CreatedAt = now
        };

        await _negotiationRepository.AddMessageAsync(msg);
        await _negotiationRepository.UpdateAsync(negotiation);
        await _negotiationRepository.SaveChangesAsync();

        return await GetSellerNegotiationDetailAsync(farmerUserId, negotiationId);
    }

    public async Task<NegotiationDetailDto> SellerRejectAsync(Guid farmerUserId, Guid negotiationId, RejectNegotiationRequestDto? request = null)
    {
        request ??= new RejectNegotiationRequestDto();

        var farmer = await _farmerRepository.GetByUserIdAsync(farmerUserId);
        if (farmer == null) throw new UnauthorizedAccessException();

        var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId, includeMessages: true);
        if (negotiation == null) throw new KeyNotFoundException("Negotiation not found.");

        if (negotiation.FarmerId != farmer.Id)
            throw new UnauthorizedAccessException();

        if (negotiation.Status != NegotiationStatus.Open && negotiation.Status != NegotiationStatus.Countered)
            throw new InvalidOperationException("Negotiation is not open.");

        if (negotiation.CurrentOfferByRole != UserRole.Buyer)
            throw new InvalidOperationException("You cannot reject your own offer.");

        var now = DateTime.UtcNow;
        negotiation.Status = NegotiationStatus.Rejected;
        negotiation.RejectedAt = now;
        negotiation.RejectionReason = request.Reason;
        negotiation.LastMessageAt = now;

        var msg = new NegotiationMessage
        {
            NegotiationId = negotiation.Id,
            SenderUserId = farmerUserId,
            SenderRole = UserRole.Farmer,
            MessageType = NegotiationMessageType.Reject,
            Body = !string.IsNullOrWhiteSpace(request.Reason) ? request.Reason : "Farmer rejected the offer.",
            IsRead = false,
            CreatedAt = now
        };

        await _negotiationRepository.AddMessageAsync(msg);
        await _negotiationRepository.UpdateAsync(negotiation);
        await _negotiationRepository.SaveChangesAsync();

        return await GetSellerNegotiationDetailAsync(farmerUserId, negotiationId);
    }

    public async Task<UnreadCountDto> GetUnreadCountAsync(Guid userId)
    {
        var count = await _negotiationRepository.GetUnreadCountForUserAsync(userId);
        return new UnreadCountDto { Count = count };
    }

    public async Task ExpireStaleNegotiationsAsync()
    {
        var now = DateTime.UtcNow;
        var stale = await _negotiationRepository.GetExpiredNegotiationsAsync(now);

        foreach (var neg in stale)
        {
            neg.Status = NegotiationStatus.Expired;
            neg.ExpiredAt = now;
            neg.LastMessageAt = now;

            var msg = new NegotiationMessage
            {
                NegotiationId = neg.Id,
                SenderUserId = neg.CurrentOfferByUserId,
                SenderRole = neg.CurrentOfferByRole,
                MessageType = NegotiationMessageType.System,
                Body = "Negotiation expired after 48 hours of inactivity.",
                IsRead = false,
                CreatedAt = now
            };

            await _negotiationRepository.AddMessageAsync(msg);
            await _negotiationRepository.UpdateAsync(neg);
        }

        if (stale.Any())
        {
            await _negotiationRepository.SaveChangesAsync();
        }
    }

    private static NegotiationSummaryDto MapToSummary(Negotiation n, Guid currentUserId, bool isBuyer)
    {
        var unread = n.Messages.Count(m => !m.IsRead && m.SenderUserId != currentUserId);
        var lastMsg = n.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault();

        string? preview = null;
        if (lastMsg != null)
        {
            if (!string.IsNullOrWhiteSpace(lastMsg.Body))
            {
                preview = lastMsg.Body.Length > 80 ? lastMsg.Body[..80] + "..." : lastMsg.Body;
            }
            else if (lastMsg.MessageType == NegotiationMessageType.Offer || lastMsg.MessageType == NegotiationMessageType.CounterOffer)
            {
                preview = $"{lastMsg.SenderRole} offered ₹{lastMsg.OfferPrice}/quintal";
            }
        }

        var items = ParseBundleItems(n.BundleItemsJson);
        var isBundle = n.IsBundle || items.Count > 1;
        var productName = isBundle && items.Count > 0
            ? $"{items[0].ProductName} + {items.Count - 1} more ({items.Count} items bundle)"
            : (n.Product?.Name ?? "Product");

        var buyerName = n.Buyer?.User?.FullName ?? "Buyer";
        return new NegotiationSummaryDto
        {
            Id = n.Id,
            Product = new NegotiationProductSummaryDto
            {
                Id = n.Product?.Id ?? n.ProductId,
                Name = productName,
                Slug = n.Product?.Slug,
                CurrentPricePerQuintal = n.Product?.PricePerQuintal ?? n.InitialPricePerQuintal,
                ImageUrl = n.Product?.ImageUrl
            },
            Farmer = new NegotiationFarmerSummaryDto
            {
                Id = n.Farmer?.Id ?? n.FarmerId,
                FarmName = n.Farmer?.FarmName ?? "Farmer",
                Location = n.Farmer?.Location ?? $"{n.Farmer?.District}, {n.Farmer?.State}",
                Rating = n.Farmer?.Rating ?? 5.0m,
                Verified = (n.Farmer?.Verified ?? 1) == 1
            },
            Buyer = new NegotiationBuyerSummaryDto
            {
                Id = n.Buyer?.Id ?? n.BuyerId,
                FullName = isBuyer ? buyerName : MaskName(buyerName),
                MaskedName = MaskName(buyerName)
            },
            Status = n.Status.ToString(),
            InitialPricePerQuintal = n.InitialPricePerQuintal,
            CurrentOfferPrice = n.CurrentOfferPrice,
            AgreedPricePerQuintal = n.AgreedPricePerQuintal,
            QuantityQuintal = n.QuantityQuintal,
            CurrentOfferBy = n.CurrentOfferByRole.ToString(),
            CurrentOfferByUserId = n.CurrentOfferByUserId,
            LastCounterPrice = n.LastCounterPrice,
            LastMessagePreview = preview,
            UnreadCount = unread,
            LastMessageAt = n.LastMessageAt,
            OpenedAt = n.OpenedAt,
            ExpiresAt = n.ExpiresAt,
            IsBundle = isBundle,
            Items = items
        };
    }

    private static NegotiationDetailDto MapToDetail(Negotiation n, Guid currentUserId, bool isBuyer)
    {
        var unread = n.Messages.Count(m => !m.IsRead && m.SenderUserId != currentUserId);
        var buyerName = n.Buyer?.User?.FullName ?? "Buyer";

        var isActive = n.Status == NegotiationStatus.Open || n.Status == NegotiationStatus.Countered;
        var myRole = isBuyer ? UserRole.Buyer : UserRole.Farmer;
        var counterpartyRole = isBuyer ? UserRole.Farmer : UserRole.Buyer;

        var canAccept = isActive && n.CurrentOfferByRole == counterpartyRole;
        var canReject = isActive && n.CurrentOfferByRole == counterpartyRole;
        var canCounter = isActive && n.CurrentOfferByRole == counterpartyRole;
        var canWithdraw = isActive && isBuyer && n.CurrentOfferByRole == UserRole.Buyer;

        var items = ParseBundleItems(n.BundleItemsJson);
        var isBundle = n.IsBundle || items.Count > 1;

        return new NegotiationDetailDto
        {
            Negotiation = new NegotiationHeaderDto
            {
                Id = n.Id,
                BuyerId = n.BuyerId,
                FarmerId = n.FarmerId,
                ProductId = n.ProductId,
                InitialPricePerQuintal = n.InitialPricePerQuintal,
                CurrentOfferPrice = n.CurrentOfferPrice,
                CurrentOfferByUserId = n.CurrentOfferByUserId,
                CurrentOfferByRole = n.CurrentOfferByRole.ToString(),
                LastCounterPrice = n.LastCounterPrice,
                Status = n.Status.ToString(),
                AgreedPricePerQuintal = n.AgreedPricePerQuintal,
                QuantityQuintal = n.QuantityQuintal,
                OpenedAt = n.OpenedAt,
                LastMessageAt = n.LastMessageAt,
                ExpiresAt = n.ExpiresAt,
                AcceptedAt = n.AcceptedAt,
                RejectedAt = n.RejectedAt,
                ExpiredAt = n.ExpiredAt,
                WithdrawnAt = n.WithdrawnAt,
                RejectionReason = n.RejectionReason,
                IsBundle = isBundle,
                Items = items
            },
            Messages = n.Messages.OrderBy(m => m.CreatedAt).Select(m => new NegotiationMessageDto
            {
                Id = m.Id,
                NegotiationId = m.NegotiationId,
                SenderUserId = m.SenderUserId,
                SenderRole = m.SenderRole.ToString(),
                SenderName = m.SenderRole == UserRole.Farmer
                    ? (n.Farmer?.FarmName ?? "Farmer")
                    : (isBuyer ? buyerName : MaskName(buyerName)),
                MessageType = m.MessageType.ToString(),
                Body = m.Body,
                OfferPrice = m.OfferPrice,
                QuantityQuintal = m.QuantityQuintal,
                BundleItems = ParseBundleItems(m.BundleItemsJson),
                IsRead = m.IsRead,
                ReadAt = m.ReadAt,
                CreatedAt = m.CreatedAt
            }).ToList(),
            Farmer = new NegotiationFarmerSummaryDto
            {
                Id = n.Farmer?.Id ?? n.FarmerId,
                FarmName = n.Farmer?.FarmName ?? "Farmer",
                Location = n.Farmer?.Location ?? $"{n.Farmer?.District}, {n.Farmer?.State}",
                Rating = n.Farmer?.Rating ?? 5.0m,
                Verified = (n.Farmer?.Verified ?? 1) == 1
            },
            Product = new NegotiationProductSummaryDto
            {
                Id = n.Product?.Id ?? n.ProductId,
                Name = isBundle && items.Count > 0 ? $"{items[0].ProductName} + {items.Count - 1} more ({items.Count} items bundle)" : (n.Product?.Name ?? "Product"),
                Slug = n.Product?.Slug,
                CurrentPricePerQuintal = n.Product?.PricePerQuintal ?? n.InitialPricePerQuintal,
                ImageUrl = n.Product?.ImageUrl
            },
            Buyer = new NegotiationBuyerSummaryDto
            {
                Id = n.Buyer?.Id ?? n.BuyerId,
                FullName = isBuyer ? buyerName : MaskName(buyerName),
                MaskedName = MaskName(buyerName)
            },
            UnreadCount = unread,
            CanAccept = canAccept,
            CanReject = canReject,
            CanCounter = canCounter,
            CanWithdraw = canWithdraw
        };
    }

    private static List<NegotiationBundleItemDto> ParseBundleItems(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new();
        try
        {
            return JsonSerializer.Deserialize<List<NegotiationBundleItemDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
        }
        catch
        {
            return new();
        }
    }

    private static string MaskName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "Buyer";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length >= 2) return $"{parts[0]} {parts[1][0]}.";
        return parts[0];
    }
}
