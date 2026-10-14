using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class PayoutConfiguration : IEntityTypeConfiguration<Payout>
{
    public void Configure(EntityTypeBuilder<Payout> builder)
    {
        builder.ToTable("Payouts");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.PayoutNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(p => p.Amount)
            .IsRequired()
            .HasPrecision(14, 2);

        builder.Property(p => p.BankAccountNameSnapshot)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(p => p.BankAccountNumberSnapshot)
            .IsRequired()
            .HasMaxLength(40);

        builder.Property(p => p.IfscCodeSnapshot)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.UpiIdSnapshot)
            .HasMaxLength(100);

        builder.Property(p => p.FailureReason)
            .HasMaxLength(300);

        builder.Property(p => p.Reference)
            .HasMaxLength(100);

        builder.Property(p => p.Notes)
            .HasMaxLength(300);

        builder.HasOne(p => p.Farmer)
            .WithMany(f => f.Payouts)
            .HasForeignKey(p => p.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.PayoutNumber)
            .IsUnique();

        builder.HasIndex(p => new { p.FarmerId, p.Status, p.RequestedAt });

        builder.HasIndex(p => new { p.Status, p.RequestedAt });
    }
}
