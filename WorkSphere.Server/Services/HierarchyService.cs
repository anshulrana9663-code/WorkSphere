using Microsoft.EntityFrameworkCore;
using WorkSphere.Server.Data.Context;
using WorkSphere.Server.Interfaces;

namespace WorkSphere.Server.Services;

public class HierarchyService : IHierarchyService
{
    private readonly ApplicationDbContext _dbContext;

    public HierarchyService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Traverses upward from the target employee to determine if managerEmployeeId is an ancestor in the management chain.
    /// </summary>
    public async Task<bool> IsSubordinateAsync(int managerEmployeeId, int targetEmployeeId, CancellationToken cancellationToken = default)
    {
        if (managerEmployeeId <= 0 || targetEmployeeId <= 0 || managerEmployeeId == targetEmployeeId)
        {
            return false;
        }

        // Direct report fast-path check
        var directReport = await _dbContext.Employees
            .Where(e => e.Id == targetEmployeeId && e.IsActive)
            .Select(e => e.ManagerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (!directReport.HasValue)
        {
            return false;
        }

        if (directReport.Value == managerEmployeeId)
        {
            return true;
        }

        // Transitive upward walk
        int? currentManagerId = directReport.Value;
        var visited = new HashSet<int> { targetEmployeeId };

        while (currentManagerId.HasValue)
        {
            if (currentManagerId.Value == managerEmployeeId)
            {
                return true;
            }

            if (!visited.Add(currentManagerId.Value))
            {
                // Prevent infinite loop if cyclic references exist
                break;
            }

            currentManagerId = await _dbContext.Employees
                .Where(e => e.Id == currentManagerId.Value && e.IsActive)
                .Select(e => e.ManagerId)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return false;
    }

    /// <summary>
    /// Retrieves all direct and indirect subordinate IDs under a given manager.
    /// </summary>
    public async Task<List<int>> GetSubordinateIdsAsync(int managerEmployeeId, CancellationToken cancellationToken = default)
    {
        if (managerEmployeeId <= 0)
        {
            return [];
        }

        var activeEmployees = await _dbContext.Employees
            .Where(e => e.IsActive)
            .Select(e => new { e.Id, e.ManagerId })
            .ToListAsync(cancellationToken);

        var lookup = activeEmployees
            .Where(e => e.ManagerId.HasValue)
            .ToLookup(e => e.ManagerId!.Value, e => e.Id);

        var subordinates = new List<int>();
        var queue = new Queue<int>();
        queue.Enqueue(managerEmployeeId);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            foreach (var subordinateId in lookup[current])
            {
                subordinates.Add(subordinateId);
                queue.Enqueue(subordinateId);
            }
        }

        return subordinates;
    }

    /// <summary>
    /// Checks if the employee manages any active employees.
    /// </summary>
    public async Task<bool> IsManagerAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        if (employeeId <= 0)
        {
            return false;
        }

        return await _dbContext.Employees
            .AnyAsync(e => e.ManagerId == employeeId && e.IsActive, cancellationToken);
    }
}

