using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using WorkSphere.Server.Entities;
using WorkSphere.Server.Helpers;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Authorization;

public static class TaskOperations
{
    public static readonly OperationAuthorizationRequirement Read = new() { Name = nameof(Read) };
    public static readonly OperationAuthorizationRequirement Create = new() { Name = nameof(Create) };
    public static readonly OperationAuthorizationRequirement UpdateStatus = new() { Name = nameof(UpdateStatus) };
    public static readonly OperationAuthorizationRequirement Complete = new() { Name = nameof(Complete) };
    public static readonly OperationAuthorizationRequirement Edit = new() { Name = nameof(Edit) };
    public static readonly OperationAuthorizationRequirement Delete = new() { Name = nameof(Delete) };
    public static readonly OperationAuthorizationRequirement Comment = new() { Name = nameof(Comment) };
}

public class TaskAuthorizationHandler : AuthorizationHandler<OperationAuthorizationRequirement, WorkTask>
{
    private readonly IHierarchyService _hierarchyService;

    public TaskAuthorizationHandler(IHierarchyService hierarchyService)
    {
        _hierarchyService = hierarchyService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OperationAuthorizationRequirement requirement,
        WorkTask resource)
    {
        // 1. Admins have unrestricted access to all task operations
        if (context.User.IsAdmin())
        {
            context.Succeed(requirement);
            return;
        }

        // 2. Identify the authenticated employee
        var employeeId = context.User.GetEmployeeId();
        if (!employeeId.HasValue)
        {
            return;
        }

        var currentEmpId = employeeId.Value;
        var isAssignee = resource.AssignedToId.HasValue && resource.AssignedToId.Value == currentEmpId;
        var isCreator = resource.AssignedById.HasValue && resource.AssignedById.Value == currentEmpId;

        // Check whether the caller is a manager (direct or indirect) of the assigned employee
        var isManagerOfAssignee = resource.AssignedToId.HasValue &&
            await _hierarchyService.IsSubordinateAsync(currentEmpId, resource.AssignedToId.Value);

        // Operation: Read
        if (requirement.Name == TaskOperations.Read.Name)
        {
            if (isAssignee || isCreator || isManagerOfAssignee)
            {
                context.Succeed(requirement);
            }
        }
        // Operation: Complete (Strict manager sign-off: Only the manager of the assignee or Admin can complete)
        else if (requirement.Name == TaskOperations.Complete.Name)
        {
            if (isManagerOfAssignee)
            {
                context.Succeed(requirement);
            }
        }
        // Operation: UpdateStatus (e.g. InProgress, InReview: Assignee or manager can update)
        else if (requirement.Name == TaskOperations.UpdateStatus.Name)
        {
            if (isAssignee || isManagerOfAssignee)
            {
                context.Succeed(requirement);
            }
        }
        // Operation: Comment (Assignee, creator, or manager)
        else if (requirement.Name == TaskOperations.Comment.Name)
        {
            if (isAssignee || isCreator || isManagerOfAssignee)
            {
                context.Succeed(requirement);
            }
        }
        // Operation: Edit / Delete (Creator if they manage the assignee, or Admin)
        else if (requirement.Name == TaskOperations.Edit.Name || requirement.Name == TaskOperations.Delete.Name)
        {
            if (isCreator && isManagerOfAssignee)
            {
                context.Succeed(requirement);
            }
        }
    }
}
