using FarmerBandh.Application.DTOs.Seller;
using FarmerBandh.Application.Interfaces;
using FarmerBandh.Domain.Entities;

namespace FarmerBandh.Application.Services;

public class BankAccountService : IBankAccountService
{
    private readonly ISellerOperationsRepository _repository;

    public BankAccountService(ISellerOperationsRepository repository)
    {
        _repository = repository;
    }

    public async Task<BankAccountDto?> GetBankAccountAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var account = await _repository.GetBankAccountAsync(farmer.Id);
        if (account == null) return null;

        return MapToDto(account);
    }

    public async Task<BankAccountDto> UpsertBankAccountAsync(Guid userId, UpsertBankAccountRequest request)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var account = await _repository.GetBankAccountAsync(farmer.Id);
        var now = DateTime.UtcNow;

        if (account == null)
        {
            account = new BankAccount
            {
                Id = Guid.NewGuid(),
                FarmerId = farmer.Id,
                AccountHolderName = request.AccountHolderName.Trim(),
                AccountNumber = request.AccountNumber.Trim(),
                IfscCode = request.IfscCode.Trim().ToUpperInvariant(),
                BankName = request.BankName.Trim(),
                BranchName = request.BranchName?.Trim(),
                UpiId = request.UpiId?.Trim(),
                IsVerified = false,
                CreatedAt = now,
                UpdatedAt = now
            };
            await _repository.AddBankAccountAsync(account);
        }
        else
        {
            account.AccountHolderName = request.AccountHolderName.Trim();
            account.AccountNumber = request.AccountNumber.Trim();
            account.IfscCode = request.IfscCode.Trim().ToUpperInvariant();
            account.BankName = request.BankName.Trim();
            account.BranchName = request.BranchName?.Trim();
            account.UpiId = request.UpiId?.Trim();
            account.UpdatedAt = now;
            await _repository.UpdateBankAccountAsync(account);
        }

        await _repository.SaveChangesAsync();
        return MapToDto(account);
    }

    public async Task DeleteBankAccountAsync(Guid userId)
    {
        var farmer = await _repository.GetFarmerByUserIdAsync(userId);
        if (farmer == null) throw new UnauthorizedAccessException("Farmer profile not found.");

        var hasPending = await _repository.HasPendingPayoutAsync(farmer.Id);
        if (hasPending)
        {
            throw new InvalidOperationException("Cannot remove bank account while pending or processing payouts exist.");
        }

        var account = await _repository.GetBankAccountAsync(farmer.Id);
        if (account != null)
        {
            await _repository.DeleteBankAccountAsync(account);
            await _repository.SaveChangesAsync();
        }
    }

    private static BankAccountDto MapToDto(BankAccount b)
    {
        var masked = MaskAccountNumber(b.AccountNumber);
        return new BankAccountDto
        {
            AccountHolderName = b.AccountHolderName,
            MaskedAccountNumber = masked,
            IfscCode = b.IfscCode,
            BankName = b.BankName,
            BranchName = b.BranchName,
            UpiId = b.UpiId,
            IsVerified = b.IsVerified,
            CreatedAt = b.CreatedAt
        };
    }

    private static string MaskAccountNumber(string account)
    {
        if (string.IsNullOrWhiteSpace(account)) return "****";
        if (account.Length <= 4) return "**** " + account;
        return "**** **** " + account[^4..];
    }
}
