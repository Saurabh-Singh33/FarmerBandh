using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class DisputeConfiguration : IEntityTypeConfiguration<Dispute>
{
    public void Configure(EntityTypeBuilder<Dispute> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Subject)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.ResolutionNote)
            .HasMaxLength(500);

        builder.HasOne(d => d.Order)
            .WithMany()
            .HasForeignKey(d => d.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.RaisedByUser)
            .WithMany()
            .HasForeignKey(d => d.RaisedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.AgainstUser)
            .WithMany()
            .HasForeignKey(d => d.AgainstUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(d => d.OrderId);
        builder.HasIndex(d => new { d.Status, d.OpenedAt });
        builder.HasIndex(d => d.RaisedByUserId);
    }
}
