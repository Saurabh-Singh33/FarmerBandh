using FarmerBandh.Application.DTOs.Reviews;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateOrderReviewsRequestValidator : AbstractValidator<CreateOrderReviewsRequest>
{
    public CreateOrderReviewsRequestValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one review item must be submitted.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty().WithMessage("ProductId is required.");
            item.RuleFor(i => i.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5 stars.");
            item.RuleFor(i => i.Title)
                .MaximumLength(120).WithMessage("Title cannot exceed 120 characters.");
            item.RuleFor(i => i.Body)
                .MaximumLength(1000).WithMessage("Review body cannot exceed 1000 characters.");
        });
    }
}

public class UpdateReviewRequestValidator : AbstractValidator<UpdateReviewRequest>
{
    public UpdateReviewRequestValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5 stars.");
        RuleFor(x => x.Title)
            .MaximumLength(120).WithMessage("Title cannot exceed 120 characters.");
        RuleFor(x => x.Body)
            .MaximumLength(1000).WithMessage("Review body cannot exceed 1000 characters.");
    }
}
