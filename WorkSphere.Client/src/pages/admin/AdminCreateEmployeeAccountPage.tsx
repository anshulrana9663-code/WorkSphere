import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import { authService } from '../../services/authService';
import type { Employee } from '../../types/employee';

export default function AdminCreateEmployeeAccountPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [salary, setSalary] = useState('');
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    employeeService.getAll()
      .then((data) => setEmployees(data.filter((employee) => employee.isActive)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load managers.'))
      .finally(() => setLoadingManagers(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !jobTitle.trim() || !managerId) {
      setError('Please complete all required fields, including the manager.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.createEmployeeAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
        jobTitle: jobTitle.trim(),
        department: department.trim() || undefined,
        hireDate: new Date(hireDate).toISOString(),
        salary: salary ? Number(salary) : undefined,
        managerId: Number(managerId),
      });
      setSuccess(`Account for ${firstName.trim()} ${lastName.trim()} was created. The employee can now sign in from the Employee portal.`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setJobTitle('');
      setDepartment('');
      setSalary('');
      setManagerId('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create the employee account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/admin/employees" className="text-sm text-indigo-600 hover:text-indigo-700">← Back to employees</Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Create employee account</h1>
        <p className="mt-1 text-sm text-slate-500">Create an Employee Identity account and profile. Admin role assignment is not available here.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" value={firstName} onChange={setFirstName} required />
          <Field label="Last name" value={lastName} onChange={setLastName} required />
          <Field label="Work email" type="email" value={email} onChange={setEmail} required />
          <Field label="Temporary password" type="password" value={password} onChange={setPassword} required />
          <Field label="Phone number" value={phoneNumber} onChange={setPhoneNumber} />
          <Field label="Job title" value={jobTitle} onChange={setJobTitle} required />
          <Field label="Department" value={department} onChange={setDepartment} />
          <Field label="Hire date" type="date" value={hireDate} onChange={setHireDate} required />
          <Field label="Salary" type="number" value={salary} onChange={setSalary} min="0" />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Manager <span className="text-red-500">*</span>
            <select
              value={managerId}
              onChange={(event) => setManagerId(event.target.value)}
              disabled={loadingManagers}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal focus:border-indigo-500 focus:outline-none"
              required
            >
              <option value="">{loadingManagers ? 'Loading managers...' : 'Select a manager'}</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.jobTitle}</option>)}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" onClick={() => navigate('/admin/employees')} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={submitting || loadingManagers} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Creating account...' : 'Create employee account'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, min }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; min?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} min={min} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal focus:border-indigo-500 focus:outline-none" />
    </label>
  );
}
