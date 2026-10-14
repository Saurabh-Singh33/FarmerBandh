using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class NegotiationMessageConfiguration : IEntityTypeConfiguration<NegotiationMessage>
{
    public void Configure(EntityTypeBuilder<NegotiationMessage> builder)
    {
        builder.ToTable("NegotiationMessages");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Body)
            .HasMaxLength(1000);

        builder.Property(m => m.OfferPrice)
            .HasPrecision(12, 2);

        builder.Property(m => m.QuantityQuintal)
            .HasPrecision(12, 2);

        builder.Property(m => m.BundleItemsJson)
            .HasColumnType("text");

        builder.Property(m => m.SenderRole)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(m => m.MessageType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(m => m.IsRead)
            .HasDefaultValue(false);

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        builder.HasOne(m => m.Negotiation)
            .WithMany(n => n.Messages)
            .HasForeignKey(m => m.NegotiationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.SenderUser)
            .WithMany()
            .HasForeignKey(m => m.SenderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(m => new { m.NegotiationId, m.CreatedAt });
        builder.HasIndex(m => new { m.SenderUserId, m.IsRead });
    }
}
