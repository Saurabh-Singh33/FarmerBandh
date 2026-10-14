using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class VerificationRequestConfiguration : IEntityTypeConfiguration<VerificationRequest>
{
    public void Configure(EntityTypeBuilder<VerificationRequest> builder)
    {
        builder.ToTable("VerificationRequests");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.RequestNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(v => v.AadhaarNumber)
            .HasMaxLength(20);

        builder.Property(v => v.LandRecordUrl)
            .HasMaxLength(500);

        builder.Property(v => v.SelfieUrl)
            .HasMaxLength(500);

        builder.Property(v => v.Notes)
            .HasMaxLength(500);

        builder.Property(v => v.RejectionReason)
            .HasMaxLength(500);

        builder.HasOne(v => v.Farmer)
            .WithMany(f => f.VerificationRequests)
            .HasForeignKey(v => v.FarmerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.ReviewedByUser)
            .WithMany()
            .HasForeignKey(v => v.ReviewedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(v => v.RequestNumber)
            .IsUnique();

        builder.HasIndex(v => new { v.FarmerId, v.Status });

        builder.HasIndex(v => new { v.Status, v.SubmittedAt });
    }
}
