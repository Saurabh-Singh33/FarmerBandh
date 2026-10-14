using FarmerBandh.Domain.Entities;
using FarmerBandh.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Slug)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(p => p.Slug)
            .IsUnique();

        builder.Property(p => p.Grade)
            .HasConversion<int>()
            .HasDefaultValue(ProductGrade.A);

        builder.Property(p => p.PricePerQuintal)
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(p => p.AvailableQuantityQuintal)
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(p => p.MinOrderQuantityQuintal)
            .HasPrecision(12, 2)
            .HasDefaultValue(1.00m);

        builder.Property(p => p.BulkDiscountPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(0.00m);

        builder.Property(p => p.BulkDiscountThresholdQuintal)
            .HasPrecision(12, 2);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.Property(p => p.Verified)
            .HasConversion<int>()
            .HasDefaultValue(ProductVerificationStatus.Unverified);

        builder.Property(p => p.Status)
            .HasConversion<int>()
            .HasDefaultValue(ProductStatus.Draft);

        builder.Property(p => p.Rating)
            .HasPrecision(3, 2)
            .HasDefaultValue(0.00m);

        builder.Property(p => p.RatingCount)
            .HasDefaultValue(0);

        builder.Property(p => p.FlaggedReason)
            .HasMaxLength(300);

        builder.Property(p => p.FlaggedAt);

        builder.Property(p => p.State)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.District)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.City)
            .HasMaxLength(100);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // Foreign Key Relationships
        builder.HasOne(p => p.Farmer)
            .WithMany(f => f.Products)
            .HasForeignKey(p => p.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Required Indexes
        builder.HasIndex(p => new { p.CategoryId, p.Status });
        builder.HasIndex(p => new { p.FarmerId, p.Status });
        builder.HasIndex(p => new { p.State, p.District, p.Status });
        builder.HasIndex(p => p.PricePerQuintal);
    }
}
