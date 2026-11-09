using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkSphere.Server.Entities;

namespace WorkSphere.Server.Data.Configurations;

public class TaskReviewConfiguration : IEntityTypeConfiguration<TaskReview>
{
    public void Configure(EntityTypeBuilder<TaskReview> builder)
    {
        builder.ToTable("TaskReviews");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.StarRating)
            .IsRequired();

        builder.Property(r => r.Comment)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(r => r.ReviewPeriod)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // The employee being reviewed
        builder.HasOne(r => r.Reviewee)
            .WithMany()
            .HasForeignKey(r => r.RevieweeId)
            .OnDelete(DeleteBehavior.Restrict);

        // The manager submitting the review
        builder.HasOne(r => r.Reviewer)
            .WithMany()
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.RevieweeId);
        builder.HasIndex(r => r.ReviewerId);
        builder.HasIndex(r => new { r.RevieweeId, r.ReviewPeriod });
    }
}

