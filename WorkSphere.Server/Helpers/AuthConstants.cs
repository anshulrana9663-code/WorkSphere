namespace WorkSphere.Server.Helpers;

public static class AuthConstants
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Employee = "Employee";
    }

    public static class Policies
    {
        public const string RequireAdminRole = "RequireAdminRole";
        public const string RequireEmployeeRole = "RequireEmployeeRole";
        public const string RequireAdminOrEmployee = "RequireAdminOrEmployee";
    }

    public static class Claims
    {
        public const string EmployeeId = "employeeId";
    }
}

