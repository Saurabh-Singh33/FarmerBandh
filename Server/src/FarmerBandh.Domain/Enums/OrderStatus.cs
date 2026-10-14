namespace FarmerBandh.Domain.Enums;

public enum OrderStatus
{
    Pending = 1,
    Confirmed = 2,
    Packed = 3,
    InTransit = 4,
    ReadyForPickup = 5,
    Delivered = 6,
    Cancelled = 7,
    Disputed = 8
}
