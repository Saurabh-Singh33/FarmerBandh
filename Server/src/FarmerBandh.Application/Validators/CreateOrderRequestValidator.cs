using FarmerBandh.Application.DTOs.CartAndOrders;
using FluentValidation;

namespace FarmerBandh.Application.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.AddressId)
            .NotEmpty().WithMessage("Delivery address is required.");

        RuleFor(x => x.DeliverySlotWindow)
            .NotEmpty().WithMessage("Delivery slot window is required.");

        RuleFor(x => x.DeliverySlotDate)
            .Must(date => date.Date >= DateTime.UtcNow.Date && date.Date <= DateTime.UtcNow.Date.AddDays(14))
            .WithMessage("Delivery slot date must be between today and 14 days in the future.");

        RuleFor(x => x.PaymentMethod)
            .InclusiveBetween(1, 4).WithMessage("Payment method must be 1 (UPI), 2 (Card), 3 (NetBanking), or 4 (COD).");
    }
}
