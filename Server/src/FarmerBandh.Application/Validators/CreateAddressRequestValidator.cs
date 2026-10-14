using System.Text.RegularExpressions;
using FarmerBandh.Application.DTOs.CartAndOrders;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateAddressRequestValidator : AbstractValidator<CreateAddressRequest>
{
    public CreateAddressRequestValidator()
    {
        RuleFor(x => x.Line1)
            .NotEmpty().WithMessage("Address Line 1 is required.")
            .MaximumLength(300);

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required.");

        RuleFor(x => x.Pincode)
            .NotEmpty().WithMessage("Pincode is required.")
            .Matches(@"^\d{6}$").WithMessage("Pincode must be exactly 6 digits.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^\+?\d{10,12}$").WithMessage("Phone number must be a valid 10-digit number.");
    }
}
