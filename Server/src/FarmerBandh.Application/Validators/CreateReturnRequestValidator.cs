using FarmerBandh.Application.DTOs.Returns;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateReturnRequestValidator : AbstractValidator<CreateReturnRequest>
{
    public CreateReturnRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Return reason is required.")
            .MaximumLength(500).WithMessage("Return reason cannot exceed 500 characters.");

        RuleFor(x => x)
            .Must(x => (x.ReasonCategory >= 1 && x.ReasonCategory <= 5) || !string.IsNullOrWhiteSpace(x.Category))
            .WithMessage("Invalid return reason category.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one return item must be specified.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.OrderItemId).NotEmpty().WithMessage("OrderItemId is required.");
            item.RuleFor(i => i.QuantityQuintal).GreaterThan(0).WithMessage("Return quantity must be greater than 0 Quintals.");
        });
    }
}
