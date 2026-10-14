using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasKey(rv => rv.Id);

        builder.Property(rv => rv.Title)
            .HasMaxLength(120);

        builder.Property(rv => rv.Body)
            .HasMaxLength(1000);

        builder.HasOne(rv => rv.Order)
            .WithMany()
            .HasForeignKey(rv => rv.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rv => rv.Product)
            .WithMany()
            .HasForeignKey(rv => rv.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rv => rv.Buyer)
            .WithMany()
            .HasForeignKey(rv => rv.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rv => rv.Farmer)
            .WithMany()
            .HasForeignKey(rv => rv.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(rv => new { rv.OrderId, rv.ProductId }).IsUnique();
        builder.HasIndex(rv => new { rv.ProductId, rv.CreatedAt });
        builder.HasIndex(rv => new { rv.FarmerId, rv.CreatedAt });
    }
}
