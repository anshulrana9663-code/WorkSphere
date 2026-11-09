using WorkSphere.Server.Entities;

namespace WorkSphere.Server.Interfaces;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user, string role, Employee? employee);
}

