using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.HasKey(ci => ci.Id);

        builder.Property(ci => ci.QuantityQuintal)
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(ci => ci.UnitPricePerQuintal)
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(ci => ci.BulkDiscountPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(0.00m);

        builder.Property(ci => ci.BulkDiscountThresholdQuintal)
            .HasPrecision(12, 2);

        builder.Property(ci => ci.LineSubtotal)
            .HasPrecision(14, 2);

        builder.Property(ci => ci.LineDiscount)
            .HasPrecision(14, 2)
            .HasDefaultValue(0.00m);

        builder.Property(ci => ci.LineTotal)
            .HasPrecision(14, 2);

        builder.HasIndex(ci => new { ci.CartId, ci.ProductId })
            .IsUnique();

        builder.HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ci => ci.Product)
            .WithMany()
            .HasForeignKey(ci => ci.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ci => ci.Farmer)
            .WithMany()
            .HasForeignKey(ci => ci.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
