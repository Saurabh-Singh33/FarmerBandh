namespace FarmerBandh.Application.DTOs.Mandi;

public class MandiRecordDto
{
    public string State { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Market { get; set; } = string.Empty;
    public string Commodity { get; set; } = string.Empty;
    public string Variety { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string ArrivalDate { get; set; } = string.Empty; // e.g. "24/10/2026"
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public decimal ModalPrice { get; set; }
    public string Unit { get; set; } = "₹/Quintal";
}

public class MandiComparisonPointDto
{
    public string PeriodLabel { get; set; } = string.Empty; // "24 Oct" or "Week 42"
    public DateTime Date { get; set; }
    public decimal AppPrice { get; set; }
    public decimal MandiModalPrice { get; set; }
    public decimal MandiMinPrice { get; set; }
    public decimal MandiMaxPrice { get; set; }
    public decimal DifferenceAmount { get; set; }
    public decimal DifferencePercentage { get; set; }
    public string Status { get; set; } = "Equal"; // "AppHigher", "MandiHigher", "Equal"
}

public class MandiPriceComparisonResponseDto
{
    public string Commodity { get; set; } = string.Empty;
    public string? State { get; set; }
    public string? District { get; set; }
    public string? Market { get; set; }
    public string Unit { get; set; } = "Quintal"; // "Quintal" or "Kg"
    public string Granularity { get; set; } = "day"; // "day" or "week"
    public decimal CurrentAppPrice { get; set; }
    public decimal CurrentMandiPrice { get; set; }
    public decimal AppPricePerKg { get; set; }
    public decimal MandiPricePerKg { get; set; }
    public decimal DifferenceAmount { get; set; }
    public decimal DifferencePercentage { get; set; }
    public string TotalMandiArrivals { get; set; } = string.Empty;
    public string PrimaryMandi { get; set; } = string.Empty;
    public string MarketSummary { get; set; } = string.Empty;
    public List<MandiComparisonPointDto> Points { get; set; } = new();
    public List<string> RelatedCommodities { get; set; } = new();
}

public class MandiLiveRatesResponseDto
{
    public string Source { get; set; } = "Government of India (Agmarknet / data.gov.in)";
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public int TotalRecords { get; set; }
    public List<MandiRecordDto> Records { get; set; } = new();
}
