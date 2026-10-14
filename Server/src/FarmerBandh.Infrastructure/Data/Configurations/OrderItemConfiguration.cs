using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);

        builder.Property(oi => oi.ProductNameSnapshot)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(oi => oi.FarmerNameSnapshot)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(oi => oi.QuantityQuintal).HasPrecision(12, 2);
        builder.Property(oi => oi.UnitPricePerQuintal).HasPrecision(12, 2);
        builder.Property(oi => oi.LineDiscount).HasPrecision(14, 2);
        builder.Property(oi => oi.LineTotal).HasPrecision(14, 2);

        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
