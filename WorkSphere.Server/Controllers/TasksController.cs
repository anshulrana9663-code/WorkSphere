using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkSphere.Server.Authorization;
using WorkSphere.Server.Data.Context;
using WorkSphere.Server.DTOs.Tasks;
using WorkSphere.Server.Entities;
using WorkSphere.Server.Helpers;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IAuthorizationService _authorizationService;
    private readonly IHierarchyService _hierarchyService;

    public TasksController(
        ApplicationDbContext dbContext,
        IAuthorizationService authorizationService,
        IHierarchyService hierarchyService)
    {
        _dbContext = dbContext;
        _authorizationService = authorizationService;
        _hierarchyService = hierarchyService;
    }

    // GET /api/tasks
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetTasks()
    {
        var isUserAdmin = User.IsAdmin();
        var employeeId = User.GetEmployeeId();

        IQueryable<WorkTask> query = _dbContext.Tasks
            .Include(t => t.AssignedBy)
            .Include(t => t.AssignedTo)
            .Include(t => t.Comments).ThenInclude(c => c.Employee)
            .Include(t => t.Attachments).ThenInclude(a => a.Employee)
            .AsNoTracking();

        if (!isUserAdmin)
        {
            if (!employeeId.HasValue)
                return Forbid();

            var currentEmpId = employeeId.Value;
            var subordinateIds = await _hierarchyService.GetSubordinateIdsAsync(currentEmpId);

            if (subordinateIds.Count > 0)
            {
                query = query.Where(t =>
                    t.AssignedToId == currentEmpId ||
                    t.AssignedById == currentEmpId ||
                    (t.AssignedToId.HasValue && subordinateIds.Contains(t.AssignedToId.Value)));
            }
            else
            {
                query = query.Where(t => t.AssignedToId == currentEmpId || t.AssignedById == currentEmpId);
            }
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        return Ok(tasks.Select(MapToDto));
    }

    // GET /api/tasks/{id}
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTaskById(int id)
    {
        var task = await _dbContext.Tasks
            .Include(t => t.AssignedBy)
            .Include(t => t.AssignedTo)
            .Include(t => t.Comments).ThenInclude(c => c.Employee)
            .Include(t => t.Attachments).ThenInclude(a => a.Employee)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound(new { message = "Task not found." });

        var authResult = await _authorizationService.AuthorizeAsync(User, task, TaskOperations.Read);
        if (!authResult.Succeeded)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "Access denied. You do not have permission to access this task."
            });

        return Ok(MapToDto(task));
    }

    // POST /api/tasks
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var assigneeExists = await _dbContext.Employees.AnyAsync(e => e.Id == request.AssignedToId && e.IsActive);
        if (!assigneeExists)
            return BadRequest(new { message = "Selected assignee does not exist or is inactive." });

        var isUserAdmin = User.IsAdmin();
        var creatorEmployeeId = User.GetEmployeeId();

        if (!isUserAdmin)
        {
            if (!creatorEmployeeId.HasValue)
                return Forbid();

            var isSubordinate = await _hierarchyService.IsSubordinateAsync(creatorEmployeeId.Value, request.AssignedToId);
            if (!isSubordinate)
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    statusCode = 403,
                    message = "Access denied. A manager can only assign tasks to employees within their reporting hierarchy."
                });
        }

        var task = new WorkTask
        {
            Name = request.Name,
            Description = request.Description,
            AssignedById = creatorEmployeeId,
            AssignedToId = request.AssignedToId,
            DueDate = request.DueDate,
            Priority = request.Priority,
            Status = Entities.Enums.WorkTaskStatus.Pending,
            CreatedDate = DateTime.UtcNow
        };

        _dbContext.Tasks.Add(task);
        await _dbContext.SaveChangesAsync();

        await _dbContext.Entry(task).Reference(t => t.AssignedBy).LoadAsync();
        await _dbContext.Entry(task).Reference(t => t.AssignedTo).LoadAsync();

        return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, MapToDto(task));
    }

    // PUT /api/tasks/{id}
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _dbContext.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found." });

        var authResult = await _authorizationService.AuthorizeAsync(User, task, TaskOperations.Edit);
        if (!authResult.Succeeded)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "Access denied. Only the manager who created this task (or an Admin) can edit it."
            });

        // Validate new assignee is still a valid subordinate (unless admin)
        if (!User.IsAdmin() && task.AssignedToId != request.AssignedToId)
        {
            var currentEmpId = User.GetEmployeeId();
            if (currentEmpId.HasValue)
            {
                var isSubordinate = await _hierarchyService.IsSubordinateAsync(currentEmpId.Value, request.AssignedToId);
                if (!isSubordinate)
                    return StatusCode(StatusCodes.Status403Forbidden, new
                    {
                        statusCode = 403,
                        message = "You can only reassign tasks to employees within your reporting hierarchy."
                    });
            }
        }

        task.Name = request.Name;
        task.Description = request.Description;
        task.AssignedToId = request.AssignedToId;
        task.DueDate = request.DueDate;
        task.Priority = request.Priority;
        task.UpdatedDate = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        await _dbContext.Entry(task).Reference(t => t.AssignedBy).LoadAsync();
        await _dbContext.Entry(task).Reference(t => t.AssignedTo).LoadAsync();

        return Ok(MapToDto(task));
    }

    // PATCH /api/tasks/{id}/status
    [Authorize]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusRequestDto request)
    {
        var task = await _dbContext.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found." });

        var requiredOperation = request.Status == Entities.Enums.WorkTaskStatus.Completed
            ? TaskOperations.Complete
            : TaskOperations.UpdateStatus;

        var authResult = await _authorizationService.AuthorizeAsync(User, task, requiredOperation);
        if (!authResult.Succeeded)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = request.Status == Entities.Enums.WorkTaskStatus.Completed
                    ? "Access denied. Only the manager of the assigned employee (or an Administrator) can mark this task as Completed."
                    : "Access denied. You do not have permission to update this task's status."
            });

        task.Status = request.Status;
        task.UpdatedDate = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, status = task.Status.ToString(), updatedDate = task.UpdatedDate });
    }

    // POST /api/tasks/{id}/comments
    [Authorize]
    [HttpPost("{id:int}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _dbContext.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found." });

        var authResult = await _authorizationService.AuthorizeAsync(User, task, TaskOperations.Comment);
        if (!authResult.Succeeded)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "Access denied. You do not have permission to comment on this task."
            });

        var employeeId = User.GetEmployeeId();
        if (!employeeId.HasValue)
            return Forbid();

        var comment = new TaskComment
        {
            TaskId = id,
            EmployeeId = employeeId.Value,
            Content = request.Content,
            CreatedDate = DateTime.UtcNow
        };

        _dbContext.TaskComments.Add(comment);
        await _dbContext.SaveChangesAsync();
        await _dbContext.Entry(comment).Reference(c => c.Employee).LoadAsync();

        return Ok(new TaskCommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            EmployeeId = comment.EmployeeId,
            EmployeeName = $"{comment.Employee.FirstName} {comment.Employee.LastName}".Trim(),
            CreatedDate = comment.CreatedDate
        });
    }

    // PATCH /api/tasks/{id}/comments/{commentId}
    [Authorize]
    [HttpPatch("{id:int}/comments/{commentId:int}")]
    public async Task<IActionResult> UpdateComment(int id, int commentId, [FromBody] UpdateCommentRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var comment = await _dbContext.TaskComments
            .Include(c => c.Employee)
            .FirstOrDefaultAsync(c => c.Id == commentId && c.TaskId == id);

        if (comment == null)
            return NotFound(new { message = "Comment not found." });

        // Only the comment author or admin can edit
        var employeeId = User.GetEmployeeId();
        if (!User.IsAdmin() && comment.EmployeeId != employeeId)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "You can only edit your own comments."
            });

        comment.Content = request.Content;
        comment.UpdatedDate = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Ok(new TaskCommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            EmployeeId = comment.EmployeeId,
            EmployeeName = $"{comment.Employee.FirstName} {comment.Employee.LastName}".Trim(),
            CreatedDate = comment.CreatedDate,
            UpdatedDate = comment.UpdatedDate
        });
    }

    // DELETE /api/tasks/{id}/comments/{commentId}
    [Authorize]
    [HttpDelete("{id:int}/comments/{commentId:int}")]
    public async Task<IActionResult> DeleteComment(int id, int commentId)
    {
        var comment = await _dbContext.TaskComments
            .FirstOrDefaultAsync(c => c.Id == commentId && c.TaskId == id);

        if (comment == null)
            return NotFound(new { message = "Comment not found." });

        var employeeId = User.GetEmployeeId();
        if (!User.IsAdmin() && comment.EmployeeId != employeeId)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "You can only delete your own comments."
            });

        _dbContext.TaskComments.Remove(comment);
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, message = "Comment deleted." });
    }

    // POST /api/tasks/{id}/attachments  (multipart/form-data)
    [Authorize]
    [HttpPost("{id:int}/attachments")]
    public async Task<IActionResult> UploadAttachment(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        const long MaxFileSize = 25 * 1024 * 1024; // 25 MB
        if (file.Length > MaxFileSize)
            return BadRequest(new { message = "File exceeds the 25 MB limit." });

        var task = await _dbContext.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found." });

        var authResult = await _authorizationService.AuthorizeAsync(User, task, TaskOperations.Comment);
        if (!authResult.Succeeded)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "Access denied. You do not have permission to upload attachments to this task."
            });

        var employeeId = User.GetEmployeeId();
        if (!employeeId.HasValue)
            return Forbid();

        // Store files in wwwroot/attachments/{taskId}/
        var uploadsFolder = Path.Combine("wwwroot", "attachments", id.ToString());
        Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(file.FileName);
        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(uploadsFolder, storedFileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var attachment = new TaskAttachment
        {
            TaskId = id,
            EmployeeId = employeeId.Value,
            Name = Path.GetFileNameWithoutExtension(file.FileName),
            FileName = file.FileName,
            StoredFileName = storedFileName,
            Size = file.Length,
            ContentType = file.ContentType,
            Location = $"/attachments/{id}/{storedFileName}",
            UploadedDate = DateTime.UtcNow
        };

        _dbContext.TaskAttachments.Add(attachment);
        await _dbContext.SaveChangesAsync();
        await _dbContext.Entry(attachment).Reference(a => a.Employee).LoadAsync();

        return Ok(new TaskAttachmentDto
        {
            Id = attachment.Id,
            Name = attachment.Name,
            FileName = attachment.FileName,
            Size = attachment.Size,
            ContentType = attachment.ContentType,
            EmployeeId = attachment.EmployeeId,
            UploadedByName = attachment.Employee != null
                ? $"{attachment.Employee.FirstName} {attachment.Employee.LastName}".Trim()
                : null,
            UploadedDate = attachment.UploadedDate
        });
    }

    // DELETE /api/tasks/{id}/attachments/{attachmentId}
    [Authorize]
    [HttpDelete("{id:int}/attachments/{attachmentId:int}")]
    public async Task<IActionResult> DeleteAttachment(int id, int attachmentId)
    {
        var attachment = await _dbContext.TaskAttachments
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.TaskId == id);

        if (attachment == null)
            return NotFound(new { message = "Attachment not found." });

        var employeeId = User.GetEmployeeId();
        if (!User.IsAdmin() && attachment.EmployeeId != employeeId)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "You can only delete attachments you uploaded."
            });

        // Remove physical file
        var filePath = Path.Combine("wwwroot", "attachments", id.ToString(), attachment.StoredFileName);
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        _dbContext.TaskAttachments.Remove(attachment);
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, message = "Attachment deleted." });
    }

    // DELETE /api/tasks/{id}
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _dbContext.Tasks.FindAsync(id);
        if (task == null)
            return NotFound(new { message = "Task not found." });

        var authResult = await _authorizationService.AuthorizeAsync(User, task, TaskOperations.Delete);
        if (!authResult.Succeeded)
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                statusCode = 403,
                message = "Access denied. Only the manager who created this task or an Administrator can delete it."
            });

        _dbContext.Tasks.Remove(task);
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true, message = "Task deleted successfully." });
    }

    private static TaskResponseDto MapToDto(WorkTask task) => new()
    {
        Id = task.Id,
        Name = task.Name,
        Description = task.Description,
        AssignedById = task.AssignedById,
        AssignedByName = task.AssignedBy != null
            ? $"{task.AssignedBy.FirstName} {task.AssignedBy.LastName}".Trim()
            : null,
        AssignedToId = task.AssignedToId,
        AssignedToName = task.AssignedTo != null
            ? $"{task.AssignedTo.FirstName} {task.AssignedTo.LastName}".Trim()
            : null,
        DueDate = task.DueDate,
        CreatedDate = task.CreatedDate,
        UpdatedDate = task.UpdatedDate,
        Status = task.Status.ToString(),
        Priority = task.Priority.ToString(),
        CommentsCount = task.Comments?.Count ?? 0,
        AttachmentsCount = task.Attachments?.Count ?? 0,
        Comments = task.Comments?
            .OrderBy(c => c.CreatedDate)
            .Select(c => new TaskCommentDto
            {
                Id = c.Id,
                Content = c.Content,
                EmployeeId = c.EmployeeId,
                EmployeeName = c.Employee != null
                    ? $"{c.Employee.FirstName} {c.Employee.LastName}".Trim()
                    : "Employee",
                CreatedDate = c.CreatedDate,
                UpdatedDate = c.UpdatedDate
            })
            .ToList() ?? [],
        Attachments = task.Attachments?
            .OrderByDescending(a => a.UploadedDate)
            .Select(a => new TaskAttachmentDto
            {
                Id = a.Id,
                Name = a.Name,
                FileName = a.FileName,
                Size = a.Size,
                ContentType = a.ContentType,
                EmployeeId = a.EmployeeId,
                UploadedByName = a.Employee != null
                    ? $"{a.Employee.FirstName} {a.Employee.LastName}".Trim()
                    : null,
                UploadedDate = a.UploadedDate
            })
            .ToList() ?? []
    };
}
