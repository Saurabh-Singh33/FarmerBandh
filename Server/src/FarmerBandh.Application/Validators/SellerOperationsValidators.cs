using System.Text.RegularExpressions;
using FarmerBandh.Application.DTOs.Seller;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateSellerListingRequestValidator : AbstractValidator<CreateSellerListingRequest>
{
    public CreateSellerListingRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MinimumLength(3).WithMessage("Product name must be at least 3 characters.");

        RuleFor(x => x.PricePerQuintal)
            .GreaterThan(0).WithMessage("Price per quintal must be greater than zero.");

        RuleFor(x => x.AvailableQuantityQuintal)
            .GreaterThanOrEqualTo(0).WithMessage("Available quantity must be greater than or equal to zero.");

        RuleFor(x => x.MinOrderQuantityQuintal)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum order quantity must be greater than or equal to zero.")
            .Must((req, min) => min <= req.AvailableQuantityQuintal || req.AvailableQuantityQuintal == 0)
            .WithMessage("Minimum order quantity cannot exceed available quantity.");

        RuleFor(x => x.Grade)
            .Must(g => string.Equals(g, "A", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(g, "B", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(g, "C", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Grade must be A, B, or C.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required.");

        RuleFor(x => x.HarvestDate)
            .Must(d => !d.HasValue || d.Value <= DateTime.UtcNow.AddDays(1))
            .WithMessage("Harvest date cannot be in the future.");
    }
}

public class UpdateSellerListingRequestValidator : AbstractValidator<UpdateSellerListingRequest>
{
    public UpdateSellerListingRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MinimumLength(3).WithMessage("Product name must be at least 3 characters.");

        RuleFor(x => x.PricePerQuintal)
            .GreaterThan(0).WithMessage("Price per quintal must be greater than zero.");

        RuleFor(x => x.AvailableQuantityQuintal)
            .GreaterThanOrEqualTo(0).WithMessage("Available quantity must be greater than or equal to zero.");

        RuleFor(x => x.MinOrderQuantityQuintal)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum order quantity must be greater than or equal to zero.")
            .Must((req, min) => min <= req.AvailableQuantityQuintal || req.AvailableQuantityQuintal == 0)
            .WithMessage("Minimum order quantity cannot exceed available quantity.");

        RuleFor(x => x.Grade)
            .Must(g => string.Equals(g, "A", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(g, "B", StringComparison.OrdinalIgnoreCase) ||
                       string.Equals(g, "C", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Grade must be A, B, or C.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required.");

        RuleFor(x => x.HarvestDate)
            .Must(d => !d.HasValue || d.Value <= DateTime.UtcNow.AddDays(1))
            .WithMessage("Harvest date cannot be in the future.");
    }
}

public class RequestPayoutDtoValidator : AbstractValidator<RequestPayoutDto>
{
    public RequestPayoutDtoValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payout amount must be greater than zero.");
    }
}

public class UpsertBankAccountRequestValidator : AbstractValidator<UpsertBankAccountRequest>
{
    private static readonly Regex IfscRegex = new(@"^[A-Z]{4}0[A-Z0-9]{6}$", RegexOptions.Compiled);
    private static readonly Regex UpiRegex = new(@"^[\w.\-]+@[\w]+$", RegexOptions.Compiled);

    public UpsertBankAccountRequestValidator()
    {
        RuleFor(x => x.AccountHolderName)
            .NotEmpty().WithMessage("Account holder name is required.")
            .MaximumLength(150);

        RuleFor(x => x.AccountNumber)
            .NotEmpty().WithMessage("Account number is required.")
            .Matches(@"^\d{9,18}$").WithMessage("Account number must be 9 to 18 digits.");

        RuleFor(x => x.IfscCode)
            .NotEmpty().WithMessage("IFSC code is required.")
            .Matches(IfscRegex).WithMessage("Invalid IFSC code format (e.g. HDFC0001234).");

        RuleFor(x => x.BankName)
            .NotEmpty().WithMessage("Bank name is required.")
            .MaximumLength(100);

        RuleFor(x => x.UpiId)
            .Must(upi => string.IsNullOrWhiteSpace(upi) || UpiRegex.IsMatch(upi))
            .WithMessage("Invalid UPI ID format (e.g. name@bank).");
    }
}

public class SubmitVerificationRequestValidator : AbstractValidator<SubmitVerificationRequest>
{
    public SubmitVerificationRequestValidator()
    {
        RuleFor(x => x.AadhaarNumber)
            .Must(a => string.IsNullOrWhiteSpace(a) || (a.Length == 12 && long.TryParse(a, out _)))
            .WithMessage("Aadhaar number must be exactly 12 digits.");
    }
}

public class ChangeSellerPasswordRequestValidator : AbstractValidator<ChangeSellerPasswordRequest>
{
    public ChangeSellerPasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("New password must be at least 8 characters.")
            .Must((req, newPass) => newPass != req.CurrentPassword)
            .WithMessage("New password must be different from current password.");
    }
}
