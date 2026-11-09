import { useState, useEffect, useMemo } from 'react';
import { employeeService } from '../../services/employeeService';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../types/employee';
import {
  TeamsIcon,
  SearchIcon,
  FilterIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrashIcon,
} from '../../components/common/Icons';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [managerId, setManagerId] = useState<number | undefined>(undefined);
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [salary, setSalary] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setJobTitle('');
    setDepartment('');
    setManagerId(undefined);
    setHireDate(new Date().toISOString().split('T')[0]);
    setSalary('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFirstName(emp.firstName || emp.name.split(' ')[0] || '');
    setLastName(emp.lastName || emp.name.split(' ').slice(1).join(' ') || '');
    setEmail(emp.email);
    setPhoneNumber(emp.phoneNumber || '');
    setJobTitle(emp.jobTitle);
    setDepartment(emp.department || '');
    setManagerId(emp.managerId ?? undefined);
    setHireDate(emp.hireDate ? emp.hireDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setSalary(emp.salary != null ? emp.salary.toString() : '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !jobTitle.trim()) {
      setFormError('Please fill in all required fields (First Name, Last Name, Email, Job Title).');
      return;
    }

    setFormSubmitting(true);
    try {
      const parsedSalary = salary ? parseFloat(salary) : undefined;

      if (editingEmployee) {
        const updatePayload: UpdateEmployeeRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          jobTitle: jobTitle.trim(),
          department: department.trim() || undefined,
          managerId: managerId || undefined,
          hireDate: new Date(hireDate).toISOString(),
          salary: parsedSalary,
        };
        await employeeService.update(editingEmployee.id, updatePayload);
        setSuccessMessage(`Employee "${firstName} ${lastName}" updated successfully.`);
      } else {
        const createPayload: CreateEmployeeRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          jobTitle: jobTitle.trim(),
          department: department.trim() || undefined,
          managerId: managerId || undefined,
          hireDate: new Date(hireDate).toISOString(),
          salary: parsedSalary,
        };
        await employeeService.create(createPayload);
        setSuccessMessage(`Employee "${firstName} ${lastName}" created successfully.`);
      }

      closeModal();
      await fetchEmployees();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'An error occurred while saving employee.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (emp: Employee) => {
    try {
      await employeeService.toggleActive(emp.id, !emp.isActive);
      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? { ...e, isActive: !e.isActive } : e))
      );
      setSuccessMessage(
        `Employee "${emp.name}" marked as ${!emp.isActive ? 'Active' : 'Inactive'}.`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update employee status.');
    }
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment =
        departmentFilter === 'all' || emp.department === departmentFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && emp.isActive) ||
        (statusFilter === 'inactive' && !emp.isActive);

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <TeamsIcon size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Employee Management</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage organization directory, reporting relationships, and employee profiles.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
        >
          <span>+ Add Employee</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircleIcon size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircleIcon size={18} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <FilterIcon
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs sm:text-sm text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Employees</option>
              <option value="inactive">Inactive / Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredEmployees.length} of {employees.length} team members
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading employee directory...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium">No employees found matching current filters.</p>
            <p className="text-xs">Try adjusting your search criteria or add a new employee.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-left">Employee</th>
                  <th className="px-6 py-3.5 text-left">Role / Department</th>
                  <th className="px-6 py-3.5 text-left">Manager</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Hire Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const initials = emp.name
                    ? emp.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'WS';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{emp.name}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Job Title & Department */}
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-800">{emp.jobTitle}</p>
                        <p className="text-xs text-slate-500">{emp.department || '—'}</p>
                      </td>

                      {/* Manager */}
                      <td className="px-6 py-3.5 text-slate-600 text-xs">
                        {emp.managerName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                            {emp.managerName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None (Executive)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                          }`}
                        >
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Hire Date */}
                      <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {emp.hireDate
                          ? new Date(emp.hireDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(emp)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              emp.isActive
                                ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {emp.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Add New Employee'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure employee profile details, organizational reporting, and compensation.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircleIcon size={16} className="text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Connor"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@worksphere.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Job Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Lead Software Engineer"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Manager */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Reports To (Manager)
                  </label>
                  <select
                    value={managerId ?? ''}
                    onChange={(e) =>
                      setManagerId(e.target.value ? parseInt(e.target.value, 10) : undefined)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">No Manager (Root)</option>
                    {employees
                      .filter((e) => !editingEmployee || e.id !== editingEmployee.id)
                      .map((mgr) => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.name} ({mgr.jobTitle})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Hire Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Annual Salary ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 115000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingEmployee
                    ? 'Update Employee'
                    : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

