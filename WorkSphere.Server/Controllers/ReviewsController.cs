using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkSphere.Server.Data.Context;
using WorkSphere.Server.DTOs.Reviews;
using WorkSphere.Server.Entities;
using WorkSphere.Server.Helpers;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IHierarchyService _hierarchyService;

    public ReviewsController(ApplicationDbContext dbContext, IHierarchyService hierarchyService)
    {
        _dbContext = dbContext;
        _hierarchyService = hierarchyService;
    }

    // GET /api/reviews  — Returns reviews visible to the caller
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetReviews([FromQuery] int? revieweeId = null)
    {
        var isAdmin = User.IsAdmin();
        var currentEmpId = User.GetEmployeeId();

        IQueryable<TaskReview> query = _dbContext.TaskReviews
            .Include(r => r.Reviewee)
            .Include(r => r.Reviewer)
            .AsNoTracking();

        if (!isAdmin)
        {
            if (!currentEmpId.HasValue)
                return Forbid();

            var subordinateIds = await _hierarchyService.GetSubordinateIdsAsync(currentEmpId.Value);

            // Managers see reviews they wrote OR reviews of their subordinates
            // Employees see only reviews about themselves
            query = query.Where(r =>
                r.RevieweeId == currentEmpId.Value ||
                r.ReviewerId == currentEmpId.Value ||
                subordinateIds.Contains(r.RevieweeId));
        }

        if (revieweeId.HasValue)
            query = query.Where(r => r.RevieweeId == revieweeId.Value);

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapToDto(r))
            .ToListAsync();

        return Ok(reviews);
    }

    // GET /api/reviews/{id}
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReviewById(int id)
    {
        var review = await _dbContext.TaskReviews
            .Include(r => r.Reviewee)
            .Include(r => r.Reviewer)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null)
            return NotFound(new { message = "Review not found." });

        var currentEmpId = User.GetEmployeeId();
        if (!User.IsAdmin())
        {
            var subordinateIds = await _hierarchyService.GetSubordinateIdsAsync(currentEmpId ?? 0);
            var canView = review.RevieweeId == currentEmpId ||
                          review.ReviewerId == currentEmpId ||
                          subordinateIds.Contains(review.RevieweeId);

            if (!canView)
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    statusCode = 403,
                    message = "Access denied."
                });
        }

        return Ok(MapToDto(review));
    }

    // GET /api/reviews/performance/{employeeId} — Employee performance summary
    [Authorize]
    [HttpGet("performance/{employeeId:int}")]
    public async Task<IActionResult> GetEmployeePerformance(int employeeId)
    {
        var currentEmpId = User.GetEmployeeId();

        // Authorization: Admin, the employee themselves, or their manager
        if (!User.IsAdmin() && currentEmpId != employeeId)
        {
            if (!currentEmpId.HasValue)
                return Forbid();

            var isSubordinate = await _hierarchyService.IsSubordinateAsync(currentEmpId.Value, employeeId);
            if (!isSubordinate)
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    statusCode = 403,
                    message = "Access denied. You can only view performance data for employees in your reporting hierarchy."
                });
        }

        var employee = await _dbContext.Employees.FindAsync(employeeId);
        if (employee == null)
            return NotFound(new { message = "Employee not found." });

        var reviews = await _dbContext.TaskReviews
            .Include(r => r.Reviewer)
            .Where(r => r.RevieweeId == employeeId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var totalTasks = await _dbContext.Tasks.CountAsync(t => t.AssignedToId == employeeId);
        var completedTasks = await _dbContext.Tasks.CountAsync(t =>
            t.AssignedToId == employeeId && t.Status == Entities.Enums.WorkTaskStatus.Completed);

        var averageRating = reviews.Count > 0 ? reviews.Average(r => r.StarRating) : 0;
        var completionRate = totalTasks > 0 ? (double)completedTasks / totalTasks * 100 : 0;

        return Ok(new EmployeePerformanceSummaryDto
        {
            EmployeeId = employee.Id,
            EmployeeName = $"{employee.FirstName} {employee.LastName}".Trim(),
            AverageRating = Math.Round(averageRating, 2),
            TotalReviews = reviews.Count,
            TotalTasksAssigned = totalTasks,
            TotalTasksCompleted = completedTasks,
            CompletionRate = Math.Round(completionRate, 2),
            Reviews = reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                RevieweeId = r.RevieweeId,
                RevieweeName = $"{employee.FirstName} {employee.LastName}".Trim(),
                RevieweeInitials = $"{employee.FirstName[0]}{(employee.LastName.Length > 0 ? employee.LastName[0] : ' ')}".Trim().ToUpperInvariant(),
                ReviewerId = r.ReviewerId,
                ReviewerName = r.Reviewer != null ? $"{r.Reviewer.FirstName} {r.Reviewer.LastName}".Trim() : string.Empty,
                StarRating = r.StarRating,
                Comment = r.Comment,
                ReviewPeriod = r.ReviewPeriod,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList()
        });
    }

    // POST /api/reviews  — Manager submits review for a subordinate
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentEmpId = User.GetEmployeeId();
        if (!currentEmpId.HasValue)
            return Forbid();

        // Admin can review anyone; managers can only review subordinates
        if (!User.IsAdmin())
        {
            var isSubordinate = await _hierarchyService.IsSubordinateAsync(currentEmpId.Value, request.RevieweeId);
            if (!isSubordinate)
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    statusCode = 403,
                    message = "Access denied. You can only review employees within your reporting hierarchy."
                });
        }

        var revieweeExists = await _dbContext.Employees.AnyAsync(e => e.Id == request.RevieweeId && e.IsActive);
        if (!revieweeExists)
            return BadRequest(new { message = "Reviewee does not exist or is inactive." });

        var review = new TaskReview
        {
            RevieweeId = request.RevieweeId,
            ReviewerId = currentEmpId.Value,
            StarRating = request.StarRating,
            Comment = request.Comment,
            ReviewPeriod = request.ReviewPeriod,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.TaskReviews.Add(review);
        await _dbContext.SaveChangesAsync();

        await _dbContext.Entry(review).Reference(r => r.Reviewee).LoadAsync();
        await _dbContext.Entry(review).Reference(r => r.Reviewer).LoadAsync();

        return CreatedAtAction(nameof(GetReviewById), new { id = review.Id }, MapToDto(review));
    }

    // PUT /api/reviews/{id}  — Only the reviewer can update
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var review = await _dbContext.TaskReviews
            .Include(r => r.Reviewee)
            .Include(r => r.Reviewer)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null)
            return NotFound(new { message = "Review not found." });

        var currentEmpId = User.GetEmployeeId();
        if (!User.IsAdmin() && review.ReviewerId != currentEmpId)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "You can only edit reviews you submitted."
            });

        review.StarRating = request.StarRating;
        review.Comment = request.Comment;
        review.ReviewPeriod = request.ReviewPeriod;
        review.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        return Ok(MapToDto(review));
    }

    // DELETE /api/reviews/{id}
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _dbContext.TaskReviews.FindAsync(id);
        if (review == null)
            return NotFound(new { message = "Review not found." });

        var currentEmpId = User.GetEmployeeId();
        if (!User.IsAdmin() && review.ReviewerId != currentEmpId)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "You can only delete reviews you submitted."
            });

        _dbContext.TaskReviews.Remove(review);
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, message = "Review deleted." });
    }

    private static ReviewResponseDto MapToDto(TaskReview r) => new()
    {
        Id = r.Id,
        RevieweeId = r.RevieweeId,
        RevieweeName = r.Reviewee != null ? $"{r.Reviewee.FirstName} {r.Reviewee.LastName}".Trim() : string.Empty,
        RevieweeInitials = r.Reviewee != null
            ? $"{r.Reviewee.FirstName[0]}{(r.Reviewee.LastName.Length > 0 ? r.Reviewee.LastName[0] : ' ')}".Trim().ToUpperInvariant()
            : string.Empty,
        ReviewerId = r.ReviewerId,
        ReviewerName = r.Reviewer != null ? $"{r.Reviewer.FirstName} {r.Reviewer.LastName}".Trim() : string.Empty,
        StarRating = r.StarRating,
        Comment = r.Comment,
        ReviewPeriod = r.ReviewPeriod,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt
    };
}

