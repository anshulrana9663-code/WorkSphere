using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkSphere.Server.Entities;

namespace WorkSphere.Server.Data.Configurations;

public class TaskCommentConfiguration : IEntityTypeConfiguration<TaskComment>
{
    public void Configure(EntityTypeBuilder<TaskComment> builder)
    {
        builder.ToTable("TaskComments");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(c => c.CreatedDate)
            .HasDefaultValueSql("GETUTCDATE()");

        // Foreign Key: Task (Cascade delete when parent task is deleted)
        builder.HasOne(c => c.Task)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign Key: Employee (Restrict to prevent multiple cascade paths in SQL Server)
        builder.HasOne(c => c.Employee)
            .WithMany(e => e.TaskComments)
            .HasForeignKey(c => c.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.TaskId);
        builder.HasIndex(c => c.EmployeeId);
    }
}

