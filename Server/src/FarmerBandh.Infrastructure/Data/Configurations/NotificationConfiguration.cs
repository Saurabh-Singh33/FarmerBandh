using FarmerBandh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FarmerBandh.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(n => n.Category)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(n => n.Title)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(n => n.Body)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(n => n.Link)
            .HasMaxLength(300);

        builder.Property(n => n.IsRead)
            .HasDefaultValue(false);

        builder.Property(n => n.RelatedEntityType)
            .HasMaxLength(60);

        builder.HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Required indexes for performance and listing
        builder.HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt })
            .HasDatabaseName("IX_Notifications_UserId_IsRead_CreatedAt");

        builder.HasIndex(n => new { n.UserId, n.CreatedAt })
            .HasDatabaseName("IX_Notifications_UserId_CreatedAt");

        builder.HasIndex(n => new { n.UserId, n.Category, n.CreatedAt })
            .HasDatabaseName("IX_Notifications_UserId_Category_CreatedAt");

        builder.HasIndex(n => new { n.RelatedEntityType, n.RelatedEntityId })
            .HasDatabaseName("IX_Notifications_RelatedEntity");

        builder.HasIndex(n => n.CreatedAt)
            .HasDatabaseName("IX_Notifications_CreatedAt");
    }
}
