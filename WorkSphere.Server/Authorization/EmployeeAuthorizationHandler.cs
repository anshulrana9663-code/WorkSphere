using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.EntityFrameworkCore;
using WorkSphere.Server.Data.Context;
using WorkSphere.Server.Entities;
using WorkSphere.Server.Helpers;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Authorization;

public static class EmployeeOperations
{
    public static readonly OperationAuthorizationRequirement Read = new() { Name = nameof(Read) };
    public static readonly OperationAuthorizationRequirement Manage = new() { Name = nameof(Manage) };
}

public class EmployeeAuthorizationHandler : AuthorizationHandler<OperationAuthorizationRequirement, Employee>
{
    private readonly IHierarchyService _hierarchyService;
    private readonly ApplicationDbContext _dbContext;

    public EmployeeAuthorizationHandler(IHierarchyService hierarchyService, ApplicationDbContext dbContext)
    {
        _hierarchyService = hierarchyService;
        _dbContext = dbContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OperationAuthorizationRequirement requirement,
        Employee resource)
    {
        // 1. Root authority: Admins have unrestricted access
        if (context.User.IsAdmin())
        {
            context.Succeed(requirement);
            return;
        }

        // 2. Identify authenticated employee
        var employeeId = context.User.GetEmployeeId();
        if (!employeeId.HasValue)
        {
            return;
        }

        var currentEmpId = employeeId.Value;

        // An employee can always read their own record
        if (resource.Id == currentEmpId && requirement.Name == EmployeeOperations.Read.Name)
        {
            context.Succeed(requirement);
            return;
        }

        // A manager can read and manage their direct or indirect subordinates
        var isSubordinate = await _hierarchyService.IsSubordinateAsync(currentEmpId, resource.Id);
        if (isSubordinate)
        {
            context.Succeed(requirement);
            return;
        }

        // Peers under the same direct manager can read basic details
        if (requirement.Name == EmployeeOperations.Read.Name && resource.ManagerId.HasValue)
        {
            var currentEmpManagerId = await _dbContext.Employees
                .Where(e => e.Id == currentEmpId)
                .Select(e => e.ManagerId)
                .FirstOrDefaultAsync();

            if (currentEmpManagerId.HasValue && currentEmpManagerId.Value == resource.ManagerId.Value)
            {
                context.Succeed(requirement);
            }
        }
    }
}

