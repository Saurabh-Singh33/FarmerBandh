using FarmerBandh.Application.DTOs.Negotiations;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateNegotiationRequestValidator : AbstractValidator<CreateNegotiationRequestDto>
{
    public CreateNegotiationRequestValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required.")
            .When(x => x.Items == null || x.Items.Count <= 1);

        RuleFor(x => x.OfferedPricePerQuintal)
            .GreaterThan(0).WithMessage("Offered price per quintal must be greater than zero.")
            .When(x => x.Items == null || x.Items.Count <= 1);

        RuleFor(x => x.QuantityQuintal)
            .GreaterThan(0).WithMessage("Quantity must be greater than zero.")
            .When(x => x.Items == null || x.Items.Count <= 1);

        RuleForEach(x => x.Items)
            .ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId).NotEmpty().WithMessage("Item ProductId is required.");
                item.RuleFor(i => i.QuantityQuintal).GreaterThan(0).WithMessage("Item Quantity must be greater than zero.");
                item.RuleFor(i => i.OfferedPricePerQuintal).GreaterThan(0).WithMessage("Item OfferedPrice must be greater than zero.");
            })
            .When(x => x.Items != null && x.Items.Count > 1);

        RuleFor(x => x.Message)
            .MaximumLength(1000).WithMessage("Message cannot exceed 1000 characters.");
    }
}
