using FarmerBandh.Application.DTOs.Catalog;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MinimumLength(3).WithMessage("Product name must be at least 3 characters.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required.");

        RuleFor(x => x.PricePerQuintal)
            .GreaterThan(0).WithMessage("Price per quintal must be greater than 0.");

        RuleFor(x => x.AvailableQuantityQuintal)
            .GreaterThanOrEqualTo(0).WithMessage("Available quantity cannot be negative.");

        RuleFor(x => x.MinOrderQuantityQuintal)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum order quantity cannot be negative.")
            .LessThanOrEqualTo(x => x.AvailableQuantityQuintal).WithMessage("Minimum order quantity cannot exceed available quantity.");

        RuleFor(x => x.Grade)
            .InclusiveBetween(1, 3).WithMessage("Grade must be 1 (A), 2 (B), or 3 (C).");

        RuleFor(x => x.HarvestDate)
            .Must(date => !date.HasValue || date.Value.Date <= DateTime.UtcNow.Date)
            .WithMessage("Harvest date cannot be in the future.");
    }
}
