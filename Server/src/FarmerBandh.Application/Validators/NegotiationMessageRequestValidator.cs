using FarmerBandh.Application.DTOs.Negotiations;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class NegotiationMessageRequestValidator : AbstractValidator<SendNegotiationMessageRequestDto>
{
    public NegotiationMessageRequestValidator()
    {
        RuleFor(x => x.MessageType)
            .Must(t => string.Equals(t, "Text", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(t, "Message", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(t, "CounterOffer", StringComparison.OrdinalIgnoreCase))
            .WithMessage("MessageType must be 'Text', 'Message', or 'CounterOffer'.");

        When(x => string.Equals(x.MessageType, "Text", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(x.MessageType, "Message", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.Body)
                .NotEmpty().WithMessage("Message body is required for text messages.")
                .Length(1, 1000).WithMessage("Message body must be between 1 and 1000 characters.");
        });

        When(x => string.Equals(x.MessageType, "CounterOffer", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.OfferPrice)
                .NotNull().WithMessage("OfferPrice is required for counter-offers.")
                .GreaterThan(0).WithMessage("OfferPrice must be greater than zero.");
        });
    }
}
