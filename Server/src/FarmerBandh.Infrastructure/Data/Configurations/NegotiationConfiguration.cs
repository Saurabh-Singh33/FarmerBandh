using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class NegotiationConfiguration : IEntityTypeConfiguration<Negotiation>
{
    public void Configure(EntityTypeBuilder<Negotiation> builder)
    {
        builder.ToTable("Negotiations");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.InitialPricePerQuintal)
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(n => n.CurrentOfferPrice)
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(n => n.LastCounterPrice)
            .HasPrecision(12, 2);

        builder.Property(n => n.AgreedPricePerQuintal)
            .HasPrecision(12, 2);

        builder.Property(n => n.QuantityQuintal)
            .HasPrecision(12, 2);

        builder.Property(n => n.IsBundle)
            .HasDefaultValue(false);

        builder.Property(n => n.BundleItemsJson)
            .HasColumnType("text");

        builder.Property(n => n.CurrentOfferByRole)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(n => n.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(n => n.RejectionReason)
            .HasMaxLength(300);

        builder.Property(n => n.OpenedAt).IsRequired();
        builder.Property(n => n.LastMessageAt).IsRequired();
        builder.Property(n => n.ExpiresAt).IsRequired();

        // Foreign keys with Restrict delete
        builder.HasOne(n => n.Buyer)
            .WithMany()
            .HasForeignKey(n => n.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(n => n.Farmer)
            .WithMany()
            .HasForeignKey(n => n.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(n => n.Product)
            .WithMany()
            .HasForeignKey(n => n.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(n => n.CurrentOfferByUser)
            .WithMany()
            .HasForeignKey(n => n.CurrentOfferByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cascade delete messages when negotiation is deleted
        builder.HasMany(n => n.Messages)
            .WithOne(m => m.Negotiation)
            .HasForeignKey(m => m.NegotiationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(n => new { n.BuyerId, n.FarmerId, n.ProductId });
        builder.HasIndex(n => new { n.BuyerId, n.LastMessageAt });
        builder.HasIndex(n => new { n.FarmerId, n.LastMessageAt });
        builder.HasIndex(n => new { n.Status, n.ExpiresAt });
    }
}
