using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkSphere.Server.Authorization;
using WorkSphere.Server.Data.Context;
using WorkSphere.Server.DTOs.Employees;
using WorkSphere.Server.Entities;
using WorkSphere.Server.Helpers;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IAuthorizationService _authorizationService;
    private readonly IHierarchyService _hierarchyService;

    public EmployeesController(
        ApplicationDbContext dbContext,
        IAuthorizationService authorizationService,
        IHierarchyService hierarchyService)
    {
        _dbContext = dbContext;
        _authorizationService = authorizationService;
        _hierarchyService = hierarchyService;
    }

    // GET /api/employees
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetEmployees()
    {
        var isUserAdmin = User.IsAdmin();
        var currentEmployeeId = User.GetEmployeeId();

        IQueryable<Employee> query = _dbContext.Employees
            .Include(e => e.Manager)
            .AsNoTracking();

        // Data-level scoping: Admins see all; non-admins see self + hierarchy + peers
        if (!isUserAdmin)
        {
            if (!currentEmployeeId.HasValue)
                return Forbid();

            var currentEmp = await _dbContext.Employees.FindAsync(currentEmployeeId.Value);
            var directManagerId = currentEmp?.ManagerId;
            var subordinateIds = await _hierarchyService.GetSubordinateIdsAsync(currentEmployeeId.Value);

            query = query.Where(e =>
                e.Id == currentEmployeeId.Value ||
                subordinateIds.Contains(e.Id) ||
                (directManagerId.HasValue && e.ManagerId == directManagerId.Value));
        }

        var employees = await query
            .OrderBy(e => e.FirstName)
            .ThenBy(e => e.LastName)
            .ToListAsync();

        return Ok(employees.Select(MapToDto));
    }

    // GET /api/employees/{id}
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetEmployeeById(int id)
    {
        var employee = await _dbContext.Employees
            .Include(e => e.Manager)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { message = "Employee not found." });

        var authResult = await _authorizationService.AuthorizeAsync(User, employee, EmployeeOperations.Read);
        if (!authResult.Succeeded)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "Access denied. You do not have permission to view this employee record."
            });

        return Ok(MapToDto(employee));
    }

    // GET /api/employees/subordinates
    [Authorize]
    [HttpGet("subordinates")]
    public async Task<IActionResult> GetSubordinates()
    {
        var currentEmployeeId = User.GetEmployeeId();
        if (!currentEmployeeId.HasValue)
            return Forbid();

        var subordinateIds = await _hierarchyService.GetSubordinateIdsAsync(currentEmployeeId.Value);

        var subordinates = await _dbContext.Employees
            .Include(e => e.Manager)
            .Where(e => subordinateIds.Contains(e.Id) && e.IsActive)
            .OrderBy(e => e.FirstName)
            .ThenBy(e => e.LastName)
            .ToListAsync();

        return Ok(subordinates.Select(MapToDto));
    }

    // POST /api/employees  — Admin only
    [Authorize(Policy = AuthConstants.Policies.RequireAdminRole)]
    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var emailExists = await _dbContext.Employees.AnyAsync(e => e.Email == request.Email);
        if (emailExists)
            return Conflict(new { message = "An employee with this email already exists." });

        if (request.ManagerId.HasValue)
        {
            var managerExists = await _dbContext.Employees.AnyAsync(e => e.Id == request.ManagerId && e.IsActive);
            if (!managerExists)
                return BadRequest(new { message = "Specified manager does not exist or is inactive." });
        }

        var employee = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            JobTitle = request.JobTitle,
            Department = request.Department,
            ManagerId = request.ManagerId,
            HireDate = request.HireDate,
            Salary = request.Salary,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync();

        await _dbContext.Entry(employee).Reference(e => e.Manager).LoadAsync();
        return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.Id }, MapToDto(employee));
    }

    // PUT /api/employees/{id}  — Admin only
    [Authorize(Policy = AuthConstants.Policies.RequireAdminRole)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var employee = await _dbContext.Employees.FindAsync(id);
        if (employee == null)
            return NotFound(new { message = "Employee not found." });

        var emailConflict = await _dbContext.Employees.AnyAsync(e => e.Email == request.Email && e.Id != id);
        if (emailConflict)
            return Conflict(new { message = "Another employee with this email already exists." });

        if (request.ManagerId.HasValue)
        {
            if (request.ManagerId.Value == id)
                return BadRequest(new { message = "An employee cannot be their own manager." });

            var managerExists = await _dbContext.Employees.AnyAsync(e => e.Id == request.ManagerId && e.IsActive);
            if (!managerExists)
                return BadRequest(new { message = "Specified manager does not exist or is inactive." });
        }

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Email = request.Email;
        employee.PhoneNumber = request.PhoneNumber;
        employee.JobTitle = request.JobTitle;
        employee.Department = request.Department;
        employee.ManagerId = request.ManagerId;
        employee.HireDate = request.HireDate;
        employee.Salary = request.Salary;
        employee.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        await _dbContext.Entry(employee).Reference(e => e.Manager).LoadAsync();

        return Ok(MapToDto(employee));
    }

    // PATCH /api/employees/{id}/active  — Admin only
    [Authorize(Policy = AuthConstants.Policies.RequireAdminRole)]
    [HttpPatch("{id:int}/active")]
    public async Task<IActionResult> ToggleActive(int id, [FromBody] ToggleEmployeeActiveDto request)
    {
        var employee = await _dbContext.Employees.FindAsync(id);
        if (employee == null)
            return NotFound(new { message = "Employee not found." });

        employee.IsActive = request.IsActive;
        employee.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, id = employee.Id, isActive = employee.IsActive });
    }

    // DELETE /api/employees/{id}  — Admin only
    [Authorize(Policy = AuthConstants.Policies.RequireAdminRole)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _dbContext.Employees.FindAsync(id);
        if (employee == null)
            return NotFound(new { message = "Employee not found." });

        // Soft-delete preferred: deactivate rather than hard delete to preserve audit trail
        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, message = "Employee deactivated successfully." });
    }

    private static EmployeeDto MapToDto(Employee e) => new()
    {
        Id = e.Id,
        Name = $"{e.FirstName} {e.LastName}".Trim(),
        FirstName = e.FirstName,
        LastName = e.LastName,
        Email = e.Email,
        PhoneNumber = e.PhoneNumber,
        JobTitle = e.JobTitle,
        Department = e.Department,
        ManagerId = e.ManagerId,
        ManagerName = e.Manager != null ? $"{e.Manager.FirstName} {e.Manager.LastName}".Trim() : null,
        IsActive = e.IsActive,
        HireDate = e.HireDate,
        Salary = e.Salary,
        CreatedAt = e.CreatedAt
    };
}
