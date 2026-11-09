namespace WorkSphere.Server.Interfaces;

public interface IHierarchyService
{
    /// <summary>
    /// Determines whether the target employee is a direct or indirect subordinate of the manager.
    /// </summary>
    Task<bool> IsSubordinateAsync(int managerEmployeeId, int targetEmployeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all direct and indirect subordinate employee IDs for a given manager.
    /// </summary>
    Task<List<int>> GetSubordinateIdsAsync(int managerEmployeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Determines whether the current employee has any subordinates (i.e. acts as a manager).
    /// </summary>
    Task<bool> IsManagerAsync(int employeeId, CancellationToken cancellationToken = default);
}

