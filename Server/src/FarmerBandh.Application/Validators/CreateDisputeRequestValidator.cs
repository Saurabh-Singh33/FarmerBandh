using FarmerBandh.Application.DTOs.Disputes;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateDisputeRequestValidator : AbstractValidator<CreateDisputeRequest>
{
    public CreateDisputeRequestValidator()
    {
        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Dispute subject is required.")
            .MaximumLength(200).WithMessage("Dispute subject cannot exceed 200 characters.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Initial message or description is required.")
            .MaximumLength(2000).WithMessage("Message cannot exceed 2000 characters.");
    }
}

public class PostDisputeMessageRequestValidator : AbstractValidator<PostDisputeMessageRequest>
{
    public PostDisputeMessageRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Message body is required.")
            .MaximumLength(2000).WithMessage("Message body cannot exceed 2000 characters.");
    }
}
