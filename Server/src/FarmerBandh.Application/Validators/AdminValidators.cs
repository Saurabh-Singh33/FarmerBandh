using FluentValidation;
using FarmerBandh.Application.DTOs.Admin;

namespace FarmerBandh.Application.Validators;

public class SuspendUserRequestValidator : AbstractValidator<SuspendUserRequest>
{
    public SuspendUserRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class RejectVerificationRequestValidator : AbstractValidator<RejectVerificationRequest>
{
    public RejectVerificationRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class FlagListingRequestValidator : AbstractValidator<FlagListingRequest>
{
    public FlagListingRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Flag reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class RemoveListingRequestValidator : AbstractValidator<RemoveListingRequest>
{
    public RemoveListingRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Removal reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class AdminOrderRefundRequestValidator : AbstractValidator<AdminOrderRefundRequest>
{
    public AdminOrderRefundRequestValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Refund amount must be greater than zero.");
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Refund reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class AdminOrderCancelRequestValidator : AbstractValidator<AdminOrderCancelRequest>
{
    public AdminOrderCancelRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class AdminResolveDisputeRequestValidator : AbstractValidator<AdminResolveDisputeRequest>
{
    public AdminResolveDisputeRequestValidator()
    {
        RuleFor(x => x.ResolutionNote)
            .NotEmpty().WithMessage("Resolution note is required.")
            .MinimumLength(3).WithMessage("Resolution note must be at least 3 characters.")
            .MaximumLength(500).WithMessage("Resolution note cannot exceed 500 characters.");

        RuleFor(x => x.Favor)
            .NotEmpty()
            .Must(f => new[] { "buyer", "seller", "neutral" }.Contains(f.ToLower()))
            .WithMessage("Favor must be 'buyer', 'seller', or 'neutral'.");
    }
}

public class AdminMarkPayoutFailedRequestValidator : AbstractValidator<AdminMarkPayoutFailedRequest>
{
    public AdminMarkPayoutFailedRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Failure reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class AdminFailRefundRequestValidator : AbstractValidator<AdminFailRefundRequest>
{
    public AdminFailRefundRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Failure reason is required.")
            .MinimumLength(3).WithMessage("Reason must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Reason cannot exceed 300 characters.");
    }
}

public class CreateCouponRequestValidator : AbstractValidator<CreateCouponRequest>
{
    public CreateCouponRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Coupon code is required.")
            .Length(3, 50).WithMessage("Coupon code must be between 3 and 50 characters.")
            .Matches("^[A-Z0-9_-]+$").WithMessage("Coupon code must be uppercase alphanumeric.");

        RuleFor(x => x.Value)
            .GreaterThan(0).WithMessage("Value must be greater than zero.");

        When(x => x.Type.Equals("Percent", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.Value)
                .LessThanOrEqualTo(100).WithMessage("Percent discount cannot exceed 100%.");
        });

        RuleFor(x => x.ValidTo)
            .GreaterThan(x => x.ValidFrom).WithMessage("Valid to date must be after valid from date.");
    }
}

public class UpdateCouponRequestValidator : AbstractValidator<UpdateCouponRequest>
{
    public UpdateCouponRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Coupon code is required.")
            .Length(3, 50).WithMessage("Coupon code must be between 3 and 50 characters.")
            .Matches("^[A-Z0-9_-]+$").WithMessage("Coupon code must be uppercase alphanumeric.");

        RuleFor(x => x.Value)
            .GreaterThan(0).WithMessage("Value must be greater than zero.");

        When(x => x.Type.Equals("Percent", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.Value)
                .LessThanOrEqualTo(100).WithMessage("Percent discount cannot exceed 100%.");
        });

        RuleFor(x => x.ValidTo)
            .GreaterThan(x => x.ValidFrom).WithMessage("Valid to date must be after valid from date.");
    }
}

public class UpdatePlatformSettingsRequestValidator : AbstractValidator<UpdatePlatformSettingsRequest>
{
    public UpdatePlatformSettingsRequestValidator()
    {
        RuleFor(x => x.CommissionPercent)
            .InclusiveBetween(0, 100).WithMessage("Commission percent must be between 0 and 100.");

        RuleFor(x => x.TaxPercent)
            .InclusiveBetween(0, 100).WithMessage("Tax percent must be between 0 and 100.");

        RuleFor(x => x.DefaultDeliveryFee)
            .GreaterThanOrEqualTo(0).WithMessage("Delivery fee cannot be negative.");

        RuleFor(x => x.PlatformFee)
            .GreaterThanOrEqualTo(0).WithMessage("Platform fee cannot be negative.");

        RuleFor(x => x.MaxDeliverySlotsPerDay)
            .GreaterThan(0).WithMessage("Max delivery slots must be at least 1.");

        When(x => !string.IsNullOrEmpty(x.SupportEmail), () =>
        {
            RuleFor(x => x.SupportEmail)
                .EmailAddress().WithMessage("Support email must be a valid email address.");
        });
    }
}

public class PromoteUserRequestValidator : AbstractValidator<PromoteUserRequest>
{
    public PromoteUserRequestValidator()
    {
        RuleFor(x => x.CurrentAdminPassword)
            .NotEmpty().WithMessage("Current admin password is required for confirmation.");
    }
}
