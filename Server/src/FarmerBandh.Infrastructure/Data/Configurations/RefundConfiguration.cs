using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class RefundConfiguration : IEntityTypeConfiguration<Refund>
{
    public void Configure(EntityTypeBuilder<Refund> builder)
    {
        builder.HasKey(rf => rf.Id);

        builder.Property(rf => rf.Amount)
            .HasPrecision(14, 2);

        builder.Property(rf => rf.Reference)
            .HasMaxLength(100);

        builder.HasOne(rf => rf.ReturnRequest)
            .WithOne(r => r.Refund)
            .HasForeignKey<Refund>(rf => rf.ReturnRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rf => rf.Order)
            .WithMany()
            .HasForeignKey(rf => rf.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rf => rf.Buyer)
            .WithMany()
            .HasForeignKey(rf => rf.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rf => rf.Seller)
            .WithMany()
            .HasForeignKey(rf => rf.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(rf => rf.OrderId);
        builder.HasIndex(rf => new { rf.SellerId, rf.Status });
    }
}
