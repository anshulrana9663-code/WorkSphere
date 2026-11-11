using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WorkSphere.Server.DTOs.Auth;
using WorkSphere.Server.Helpers;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IAntiforgery _antiforgery;
    private readonly JwtSettings _jwtSettings;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        IAuthService _authService,
        IAntiforgery _antiforgery,
        IOptions<JwtSettings> jwtOptions,
        IWebHostEnvironment _environment)
    {
        this._authService = _authService;
        this._antiforgery = _antiforgery;
        this._jwtSettings = jwtOptions.Value;
        this._environment = _environment;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, user, token) = await _authService.LoginAsync(request);
        if (!success || token == null || user == null)
        {
            return Unauthorized(new { message = error ?? "Invalid credentials." });
        }

        // Set secure HttpOnly cookie for the JWT token
        SetAuthCookie(token);

        // Generate and set CSRF cookie
        SetCsrfCookie();

        return Ok(new { success = true, user });
    }

    [Authorize(Policy = AuthConstants.Policies.RequireAdminRole)]
    [HttpPost("employees")]
    public async Task<IActionResult> CreateEmployeeAccount([FromBody] CreateEmployeeAccountRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, user) = await _authService.CreateEmployeeAccountAsync(request);
        if (!success || user == null)
        {
            return BadRequest(new { message = error ?? "Unable to create the employee account." });
        }

        return Ok(new
        {
            success = true,
            message = "Employee account created successfully.",
            user
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        ClearAuthCookies();
        return Ok(new { success = true, message = "Logged out successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Invalid token claims." });
        }

        var (success, error, user) = await _authService.GetCurrentUserAsync(userId);
        if (!success || user == null)
        {
            return NotFound(new { message = error ?? "User not found." });
        }

        return Ok(user);
    }

    [HttpGet("csrf-token")]
    public IActionResult GetCsrfToken()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        SetCsrfCookie();
        return Ok(new { csrfToken = tokens.RequestToken });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, resetToken) = await _authService.ForgotPasswordAsync(request);
        if (!success)
        {
            return BadRequest(new { message = error });
        }

        return Ok(new
        {
            message = "If your email is registered, you will receive password reset instructions.",
            // In development mode, provide the token for verification and testing
            resetToken = _environment.IsDevelopment() ? resetToken : null
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error) = await _authService.ResetPasswordAsync(request);
        if (!success)
        {
            return BadRequest(new { message = error ?? "Failed to reset password." });
        }

        return Ok(new { success = true, message = "Password has been reset successfully." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not identified." });
        }

        var (success, error) = await _authService.ChangePasswordAsync(userId, request);
        if (!success)
        {
            return BadRequest(new { message = error ?? "Failed to change password." });
        }

        return Ok(new { success = true, message = "Password changed successfully." });
    }

    private void SetAuthCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps || !_environment.IsDevelopment(),
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.DurationInMinutes),
            Path = "/"
        };

        Response.Cookies.Append("ws_auth_token", token, cookieOptions);
    }

    private void SetCsrfCookie()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        if (!string.IsNullOrEmpty(tokens.RequestToken))
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = false, // Client JavaScript reads this to pass in X-XSRF-TOKEN header
                Secure = Request.IsHttps || !_environment.IsDevelopment(),
                SameSite = SameSiteMode.None,
                Path = "/"
            };

            Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, cookieOptions);
        }
    }

    private void ClearAuthCookies()
    {
        var deleteOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps || !_environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Path = "/"
        };

        Response.Cookies.Delete("ws_auth_token", deleteOptions);

        deleteOptions.HttpOnly = false;
        Response.Cookies.Delete("XSRF-TOKEN", deleteOptions);
    }
}

