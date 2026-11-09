using System.Security.Claims;

namespace WorkSphere.Server.Helpers;

public static class UserExtensions
{
    public static string? GetUserId(this ClaimsPrincipal principal)
    {
        return principal.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    public static int? GetEmployeeId(this ClaimsPrincipal principal)
    {
        var claimValue = principal.FindFirstValue(AuthConstants.Claims.EmployeeId)
            ?? principal.FindFirstValue("employeeId");
        return int.TryParse(claimValue, out var id) ? id : null;
    }

    public static string? GetRole(this ClaimsPrincipal principal)
    {
        return principal.FindFirstValue(ClaimTypes.Role) ?? principal.FindFirstValue("role");
    }

    public static bool IsAdmin(this ClaimsPrincipal principal)
    {
        return principal.IsInRole(AuthConstants.Roles.Admin)
            || principal.HasClaim(ClaimTypes.Role, AuthConstants.Roles.Admin)
            || principal.HasClaim("role", AuthConstants.Roles.Admin);
    }

    public static bool IsEmployee(this ClaimsPrincipal principal)
    {
        return principal.IsInRole(AuthConstants.Roles.Employee)
            || principal.HasClaim(ClaimTypes.Role, AuthConstants.Roles.Employee)
            || principal.HasClaim("role", AuthConstants.Roles.Employee);
    }
}

