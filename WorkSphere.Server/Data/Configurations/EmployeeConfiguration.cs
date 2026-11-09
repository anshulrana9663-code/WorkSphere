using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkSphere.Server.Entities;

namespace WorkSphere.Server.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(e => e.Email)
            .IsUnique();

        builder.Property(e => e.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(e => e.JobTitle)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Department)
            .HasMaxLength(100);

        builder.Property(e => e.Salary)
            .HasPrecision(18, 2);

        builder.Property(e => e.HireDate)
            .IsRequired();

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Self-referencing relationship: Manager -> DirectReports
        builder.HasOne(e => e.Manager)
            .WithMany(m => m.DirectReports)
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // One-to-one relationship with ASP.NET Core Identity ApplicationUser
        builder.HasOne(e => e.User)
            .WithOne(u => u.Employee)
            .HasForeignKey<Employee>(e => e.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.UserId)
            .IsUnique()
            .HasFilter("[UserId] IS NOT NULL");
    }
}

