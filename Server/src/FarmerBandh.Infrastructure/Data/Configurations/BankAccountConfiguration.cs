using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class BankAccountConfiguration : IEntityTypeConfiguration<BankAccount>
{
    public void Configure(EntityTypeBuilder<BankAccount> builder)
    {
        builder.ToTable("BankAccounts");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.AccountHolderName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(b => b.AccountNumber)
            .IsRequired()
            .HasMaxLength(40);

        builder.Property(b => b.IfscCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(b => b.BankName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.BranchName)
            .HasMaxLength(100);

        builder.Property(b => b.UpiId)
            .HasMaxLength(100);

        builder.Property(b => b.IsVerified)
            .HasDefaultValue(false);

        builder.HasOne(b => b.Farmer)
            .WithOne(f => f.BankAccount)
            .HasForeignKey<BankAccount>(b => b.FarmerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => b.FarmerId)
            .IsUnique();
    }
}
