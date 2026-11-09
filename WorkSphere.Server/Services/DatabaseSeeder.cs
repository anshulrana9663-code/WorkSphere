using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WorkSphere.Server.Data.Context;
using WorkSphere.Server.Entities;

namespace WorkSphere.Server.Services;

public static class DatabaseSeeder
{
    public static async Task SeedDatabaseAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // 1. Seed Roles
        string[] roles = ["Admin", "Employee"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Seed Admin User
        const string adminEmail = "admin@worksphere.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        Employee? adminEmployee = null;

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");

                adminEmployee = new Employee
                {
                    FirstName = "Sarah",
                    LastName = "Connor",
                    Email = adminEmail,
                    JobTitle = "Engineering Lead",
                    Department = "Engineering",
                    HireDate = DateTime.UtcNow.AddYears(-3),
                    IsActive = true,
                    UserId = adminUser.Id
                };

                dbContext.Employees.Add(adminEmployee);
                await dbContext.SaveChangesAsync();
            }
        }
        else
        {
            adminEmployee = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == adminUser.Id);
        }

        // 3. Seed Employee User
        const string employeeEmail = "employee@worksphere.com";
        var empUser = await userManager.FindByEmailAsync(employeeEmail);
        Employee? employee = null;

        if (empUser == null)
        {
            empUser = new ApplicationUser
            {
                UserName = employeeEmail,
                Email = employeeEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(empUser, "Employee@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(empUser, "Employee");

                employee = new Employee
                {
                    FirstName = "Alex",
                    LastName = "Morgan",
                    Email = employeeEmail,
                    JobTitle = "Product Lead",
                    Department = "Engineering",
                    HireDate = DateTime.UtcNow.AddYears(-1),
                    IsActive = true,
                    UserId = empUser.Id,
                    ManagerId = adminEmployee?.Id
                };

                dbContext.Employees.Add(employee);
                await dbContext.SaveChangesAsync();
            }
        }
        else
        {
            employee = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == empUser.Id);
        }

        // 4. Seed Additional Employees
        if (adminEmployee != null)
        {
            var additionalEmployees = new (string FirstName, string LastName, string Email, string Phone, string Title, string Dept, int MonthsAgo, decimal Salary)[]
            {
                ("David", "Kim", "david.kim@worksphere.com", "+1 (555) 234-5678", "Senior Frontend Engineer", "Engineering", 24, 115000),
                ("Elena", "Rostova", "elena.rostova@worksphere.com", "+1 (555) 345-6789", "Senior Backend Engineer", "Engineering", 12, 120000),
                ("Marcus", "Chen", "marcus.chen@worksphere.com", "+1 (555) 456-7890", "Product Designer", "Design", 14, 105000),
                ("Rachel", "Green", "rachel.green@worksphere.com", "+1 (555) 567-8901", "QA Automation Lead", "Quality Assurance", 8, 98000),
            };

            foreach (var empInfo in additionalEmployees)
            {
                if (!await dbContext.Employees.AnyAsync(e => e.Email == empInfo.Email))
                {
                    dbContext.Employees.Add(new Employee
                    {
                        FirstName = empInfo.FirstName,
                        LastName = empInfo.LastName,
                        Email = empInfo.Email,
                        PhoneNumber = empInfo.Phone,
                        JobTitle = empInfo.Title,
                        Department = empInfo.Dept,
                        HireDate = DateTime.UtcNow.AddMonths(-empInfo.MonthsAgo),
                        Salary = empInfo.Salary,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        ManagerId = adminEmployee.Id
                    });
                }
            }
            await dbContext.SaveChangesAsync();
        }

        // 5. Seed Initial Tasks
        if (adminEmployee != null && employee != null)
        {
            var marcus = await dbContext.Employees.FirstOrDefaultAsync(e => e.Email == "marcus.chen@worksphere.com");

            if (!await dbContext.Tasks.AnyAsync(t => t.Name == "Design API Authorization Architecture"))
            {
                dbContext.Tasks.Add(new WorkTask
                {
                    Name = "Design API Authorization Architecture",
                    Description = "Implement role-based and resource-based authorization with JWT bearer cookies.",
                    AssignedById = adminEmployee.Id,
                    AssignedToId = employee.Id,
                    DueDate = DateTime.UtcNow.AddDays(7),
                    Priority = Entities.Enums.WorkTaskPriority.High,
                    Status = Entities.Enums.WorkTaskStatus.InProgress,
                    CreatedDate = DateTime.UtcNow.AddDays(-2)
                });
            }

            if (!await dbContext.Tasks.AnyAsync(t => t.Name == "Review Code Quality and Anti-CSRF Protection"))
            {
                dbContext.Tasks.Add(new WorkTask
                {
                    Name = "Review Code Quality and Anti-CSRF Protection",
                    Description = "Ensure Double Submit Cookie pattern and HttpOnly flags are active on production builds.",
                    AssignedById = adminEmployee.Id,
                    AssignedToId = employee.Id,
                    DueDate = DateTime.UtcNow.AddDays(14),
                    Priority = Entities.Enums.WorkTaskPriority.Medium,
                    Status = Entities.Enums.WorkTaskStatus.Pending,
                    CreatedDate = DateTime.UtcNow.AddDays(-1)
                });
            }

            if (!await dbContext.Tasks.AnyAsync(t => t.Name == "Implement JWT Bearer Cookie Authentication Scheme"))
            {
                dbContext.Tasks.Add(new WorkTask
                {
                    Name = "Implement JWT Bearer Cookie Authentication Scheme",
                    Description = "Configure HttpOnly cookie authentication and double-submit CSRF token headers.",
                    AssignedById = adminEmployee.Id,
                    AssignedToId = employee.Id,
                    DueDate = DateTime.UtcNow.AddDays(-3),
                    Priority = Entities.Enums.WorkTaskPriority.Urgent,
                    Status = Entities.Enums.WorkTaskStatus.Completed,
                    CreatedDate = DateTime.UtcNow.AddDays(-10)
                });
            }

            if (!await dbContext.Tasks.AnyAsync(t => t.Name == "Build Responsive Multi-Role Navigation Shell"))
            {
                dbContext.Tasks.Add(new WorkTask
                {
                    Name = "Build Responsive Multi-Role Navigation Shell",
                    Description = "Create Tailwind CSS responsive layout shell with role-aware sidebar navigation.",
                    AssignedById = adminEmployee.Id,
                    AssignedToId = employee.Id,
                    DueDate = DateTime.UtcNow.AddDays(-5),
                    Priority = Entities.Enums.WorkTaskPriority.Medium,
                    Status = Entities.Enums.WorkTaskStatus.Completed,
                    CreatedDate = DateTime.UtcNow.AddDays(-12)
                });
            }

            if (!await dbContext.Tasks.AnyAsync(t => t.Name == "Audit Database Query Indexing & Migration Constraints"))
            {
                dbContext.Tasks.Add(new WorkTask
                {
                    Name = "Audit Database Query Indexing & Migration Constraints",
                    Description = "Inspect EF Core execution plans and verify index coverage for subordinate hierarchy queries.",
                    AssignedById = adminEmployee.Id,
                    AssignedToId = employee.Id,
                    DueDate = DateTime.UtcNow.AddDays(-1),
                    Priority = Entities.Enums.WorkTaskPriority.High,
                    Status = Entities.Enums.WorkTaskStatus.Pending,
                    CreatedDate = DateTime.UtcNow.AddDays(-4)
                });
            }

            if (marcus != null && !await dbContext.Tasks.AnyAsync(t => t.Name == "Design Figma Component Library & Design Tokens"))
            {
                dbContext.Tasks.Add(new WorkTask
                {
                    Name = "Design Figma Component Library & Design Tokens",
                    Description = "Establish unified typography, color palette tokens, and standard accessible button components.",
                    AssignedById = adminEmployee.Id,
                    AssignedToId = marcus.Id,
                    DueDate = DateTime.UtcNow.AddDays(6),
                    Priority = Entities.Enums.WorkTaskPriority.Medium,
                    Status = Entities.Enums.WorkTaskStatus.InProgress,
                    CreatedDate = DateTime.UtcNow.AddDays(-2)
                });
            }

            await dbContext.SaveChangesAsync();

            // Seed Comments
            var task1 = await dbContext.Tasks.FirstOrDefaultAsync(t => t.Name == "Design API Authorization Architecture");
            if (task1 != null && !await dbContext.TaskComments.AnyAsync(c => c.TaskId == task1.Id))
            {
                dbContext.TaskComments.Add(new TaskComment
                {
                    TaskId = task1.Id,
                    EmployeeId = adminEmployee.Id,
                    Content = "Alex, please focus on resource-scoped checks for task management first.",
                    CreatedDate = DateTime.UtcNow.AddDays(-1)
                });
                await dbContext.SaveChangesAsync();
            }

            // 6. Seed Reviews
            if (!await dbContext.TaskReviews.AnyAsync(r => r.RevieweeId == employee.Id))
            {
                dbContext.TaskReviews.AddRange(
                    new TaskReview
                    {
                        RevieweeId = employee.Id,
                        ReviewerId = adminEmployee.Id,
                        StarRating = 5,
                        Comment = "Outstanding architectural execution on the core authorization scheme and API contracts. Consistently meets milestones with high attention to code quality.",
                        ReviewPeriod = "Q3 2026",
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new TaskReview
                    {
                        RevieweeId = employee.Id,
                        ReviewerId = adminEmployee.Id,
                        StarRating = 4,
                        Comment = "Excellent collaboration and strong frontend modularization. Keep up the high delivery tempo as we scale sprint goals.",
                        ReviewPeriod = "Oct 2026",
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    }
                );
                await dbContext.SaveChangesAsync();
            }
        }
    }
}

