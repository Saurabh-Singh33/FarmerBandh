using FarmerBandh.Application.DTOs.CartAndOrders;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class AddCartItemRequestValidator : AbstractValidator<AddCartItemRequest>
{
    public AddCartItemRequestValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("ProductId is required.");

        RuleFor(x => x.QuantityQuintal)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0.");
    }
}
