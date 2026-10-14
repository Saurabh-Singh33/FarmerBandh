namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class AddCartItemRequest
{
    public Guid ProductId { get; set; }
    public decimal QuantityQuintal { get; set; }
    public decimal? NegotiatedUnitPrice { get; set; }
}
