namespace FarmerBandh.Application.DTOs.CartAndOrders;

public class OrderPlacementResultDto
{
    public decimal GrandTotal { get; set; }
    public IEnumerable<OrderSummaryDto> Orders { get; set; } = new List<OrderSummaryDto>();
}
