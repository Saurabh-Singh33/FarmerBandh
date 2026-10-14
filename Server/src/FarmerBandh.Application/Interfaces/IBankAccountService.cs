using FarmerBandh.Application.DTOs.Seller;

namespace FarmerBandh.Application.Interfaces;

public interface IBankAccountService
{
    Task<BankAccountDto?> GetBankAccountAsync(Guid userId);
    Task<BankAccountDto> UpsertBankAccountAsync(Guid userId, UpsertBankAccountRequest request);
    Task DeleteBankAccountAsync(Guid userId);
}
