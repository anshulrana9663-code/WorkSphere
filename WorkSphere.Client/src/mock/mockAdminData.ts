export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatarColor: string;
  initials: string;
  managerId: string | null;
}

export interface ReviewEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeInitials: string;
  employeeColor: string;
  reviewerName: string;
  starRating: number;
  comment: string;
  reviewPeriod: string;
  createdAt: string;
}

// Employees visible to admin (scoped - all for director, subset for manager)
export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'Alex Morgan',
    email: 'alex.morgan@worksphere.internal',
    department: 'Engineering',
    position: 'Product Lead',
    avatarColor: 'bg-indigo-600',
    initials: 'AM',
    managerId: 'admin-002',
  },
  {
    id: 'emp-002',
    name: 'Jordan Lee',
    email: 'jordan.lee@worksphere.internal',
    department: 'Engineering',
    position: 'Frontend Developer',
    avatarColor: 'bg-violet-600',
    initials: 'JL',
    managerId: 'admin-002',
  },
  {
    id: 'emp-003',
    name: 'Casey Park',
    email: 'casey.park@worksphere.internal',
    department: 'Design',
    position: 'UI Designer',
    avatarColor: 'bg-pink-500',
    initials: 'CP',
    managerId: 'admin-003',
  },
  {
    id: 'emp-004',
    name: 'Riley Chen',
    email: 'riley.chen@worksphere.internal',
    department: 'Product',
    position: 'Product Manager',
    avatarColor: 'bg-teal-500',
    initials: 'RC',
    managerId: 'admin-002',
  },
  {
    id: 'emp-005',
    name: 'Taylor Wright',
    email: 'taylor.wright@worksphere.internal',
    department: 'Engineering',
    position: 'Backend Developer',
    avatarColor: 'bg-amber-500',
    initials: 'TW',
    managerId: 'admin-003',
  },
];

export const MOCK_REVIEWS: ReviewEntry[] = [
  {
    id: 'rev-001',
    employeeId: 'emp-001',
    employeeName: 'Alex Morgan',
    employeeInitials: 'AM',
    employeeColor: 'bg-indigo-600',
    reviewerName: 'Sarah Connor',
    starRating: 4,
    comment: 'Consistently delivers quality work. Needs to improve deadline adherence.',
    reviewPeriod: 'Oct 2026',
    createdAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'rev-002',
    employeeId: 'emp-002',
    employeeName: 'Jordan Lee',
    employeeInitials: 'JL',
    employeeColor: 'bg-violet-600',
    reviewerName: 'Sarah Connor',
    starRating: 5,
    comment: 'Outstanding frontend skills. Excellent communicator and team player.',
    reviewPeriod: 'Oct 2026',
    createdAt: '2026-10-29T11:00:00Z',
  },
  {
    id: 'rev-003',
    employeeId: 'emp-001',
    employeeName: 'Alex Morgan',
    employeeInitials: 'AM',
    employeeColor: 'bg-indigo-600',
    reviewerName: 'David Kim',
    starRating: 3,
    comment: 'Good technical contributions this quarter but missed some key deadlines.',
    reviewPeriod: 'Sep 2026',
    createdAt: '2026-09-30T09:00:00Z',
  },
  {
    id: 'rev-004',
    employeeId: 'emp-004',
    employeeName: 'Riley Chen',
    employeeInitials: 'RC',
    employeeColor: 'bg-teal-500',
    reviewerName: 'Sarah Connor',
    starRating: 4,
    comment: 'Strong product thinking. Riley has shown great initiative this quarter.',
    reviewPeriod: 'Oct 2026',
    createdAt: '2026-10-30T14:00:00Z',
  },
];
