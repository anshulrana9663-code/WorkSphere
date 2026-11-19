using Microsoft.AspNetCore.Identity;
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

        // 2. Seed Admin User & Employee
        const string adminEmail = "admin@worksphere.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

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

                var adminEmployee = new Employee
                {
                    FirstName = "Admin",
                    LastName = "User",
                    Email = adminEmail,
                    JobTitle = "Engineering Lead",
                    Department = "Leadership",
                    HireDate = DateTime.UtcNow,
                    IsActive = true,
                    UserId = adminUser.Id
                };

                dbContext.Employees.Add(adminEmployee);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
