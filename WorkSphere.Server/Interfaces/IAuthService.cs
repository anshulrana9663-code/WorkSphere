using WorkSphere.Server.DTOs.Auth;

namespace WorkSphere.Server.Interfaces;

public interface IAuthService
{
    Task<(bool Success, string? Error, UserResponseDto? User, string? Token)> LoginAsync(LoginRequestDto request);
    Task<(bool Success, string? Error, UserResponseDto? User)> GetCurrentUserAsync(string userId);
    Task<(bool Success, string? Error, UserResponseDto? User)> CreateEmployeeAccountAsync(CreateEmployeeAccountRequestDto request);
    Task<(bool Success, string? Error, string? ResetToken)> ForgotPasswordAsync(ForgotPasswordRequestDto request);
    Task<(bool Success, string? Error)> ResetPasswordAsync(ResetPasswordRequestDto request);
    Task<(bool Success, string? Error)> ChangePasswordAsync(string userId, ChangePasswordRequestDto request);
}

