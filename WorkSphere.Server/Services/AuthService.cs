using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WorkSphere.Server.Data.Context;
using WorkSphere.Server.DTOs.Auth;
using WorkSphere.Server.Entities;
using WorkSphere.Server.Helpers;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly ITokenService _tokenService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext dbContext,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _tokenService = tokenService;
    }

    public async Task<(bool Success, string? Error, UserResponseDto? User, string? Token)> LoginAsync(LoginRequestDto request)
    {

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return (false, "Invalid email or password.", null, null);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return (false, "Invalid email or password.", null, null);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Employee";

        var employee = await _dbContext.Employees
            .Include(e => e.Manager)
            .FirstOrDefaultAsync(e => e.UserId == user.Id);

        var token = _tokenService.GenerateToken(user, primaryRole, employee);
        var userResponse = MapToUserResponseDto(user, primaryRole, employee);

        return (true, null, userResponse, token);
    }

    public async Task<(bool Success, string? Error, UserResponseDto? User)> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found.", null);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Employee";

        var employee = await _dbContext.Employees
            .Include(e => e.Manager)
            .FirstOrDefaultAsync(e => e.UserId == user.Id);

        var userResponse = MapToUserResponseDto(user, primaryRole, employee);
        return (true, null, userResponse);
    }

    public async Task<(bool Success, string? Error, UserResponseDto? User)> CreateEmployeeAccountAsync(CreateEmployeeAccountRequestDto request)
    {
        var email = request.Email.Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var employeeExists = await _dbContext.Employees
            .AnyAsync(e => e.Email.ToUpper() == normalizedEmail);
        if (employeeExists)
        {
            return (false, "An employee with this email already exists.", null);
        }

        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return (false, "A user with this email already exists.", null);
        }

        var manager = await _dbContext.Employees
            .FirstOrDefaultAsync(e => e.Id == request.ManagerId && e.IsActive);
        if (manager == null)
        {
            return (false, "Specified manager does not exist or is inactive.", null);
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                await transaction.RollbackAsync();
                return (false, GetIdentityError(createResult), null);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, AuthConstants.Roles.Employee);
            if (!roleResult.Succeeded)
            {
                await transaction.RollbackAsync();
                return (false, GetIdentityError(roleResult), null);
            }

            var employee = new Employee
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                PhoneNumber = request.PhoneNumber,
                JobTitle = request.JobTitle.Trim(),
                Department = request.Department,
                HireDate = request.HireDate,
                Salary = request.Salary,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ManagerId = manager.Id,
                UserId = user.Id
            };

            _dbContext.Employees.Add(employee);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            employee.Manager = manager;
            return (true, null, MapToUserResponseDto(user, AuthConstants.Roles.Employee, employee));
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<(bool Success, string? Error, string? ResetToken)> ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Do not reveal that the user does not exist for security reasons, return generic success
            return (true, null, null);
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        return (true, null, token);
    }

    public async Task<(bool Success, string? Error)> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return (false, "Invalid request.");
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to reset password.";
            return (false, firstError);
        }

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> ChangePasswordAsync(string userId, ChangePasswordRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Failed to change password.";
            return (false, firstError);
        }

        return (true, null);
    }

    private static UserResponseDto MapToUserResponseDto(ApplicationUser user, string role, Employee? employee)
    {
        var fullName = employee != null
            ? $"{employee.FirstName} {employee.LastName}".Trim()
            : user.UserName ?? user.Email ?? "User";

        var initials = string.Join("", fullName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p[0]))
            .ToUpperInvariant();

        if (string.IsNullOrEmpty(initials))
        {
            initials = "WS";
        }
        else if (initials.Length > 2)
        {
            initials = initials[..2];
        }

        var isDirector = role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        var avatarColor = isDirector ? "bg-emerald-600" : "bg-indigo-600";

        return new UserResponseDto
        {
            Id = employee != null ? employee.Id.ToString() : user.Id,
            Name = fullName,
            Email = user.Email ?? string.Empty,
            Role = role,
            Department = employee?.Department ?? "General",
            Position = employee?.JobTitle ?? (isDirector ? "Engineering Lead" : "Team Member"),
            AvatarColor = avatarColor,
            Initials = initials,
            IsDirector = isDirector,
            ManagerId = employee?.ManagerId?.ToString(),
            DirectorId = null
        };
    }

    private static string GetIdentityError(IdentityResult result)
    {
        return result.Errors.FirstOrDefault()?.Description ?? "Unable to create the user account.";
    }
}

