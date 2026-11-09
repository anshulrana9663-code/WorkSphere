export interface PerformanceScore {
  overall: number; // 0-100
  completionRate: number; // 0-100
  onTimeRate: number; // 0-100
  reviewScore: number; // 0-100
}

export interface MonthlyTrend {
  month: string;
  score: number;
}

export interface ReviewEntry {
  id: string;
  reviewerName: string;
  reviewerInitials: string;
  reviewerColor: string;
  starRating: number; // 1-5
  comment: string;
  reviewPeriod: string; // e.g. "Oct 2026"
  createdAt: string;
}

export interface PerformanceData {
  score: PerformanceScore;
  monthlyTrend: MonthlyTrend[];
  reviews: ReviewEntry[];
  improvementTips: string[];
}

export const MOCK_PERFORMANCE_DATA: PerformanceData = {
  score: {
    overall: 74,
    completionRate: 82,
    onTimeRate: 71,
    reviewScore: 68,
  },
  monthlyTrend: [
    { month: 'May', score: 60 },
    { month: 'Jun', score: 65 },
    { month: 'Jul', score: 68 },
    { month: 'Aug', score: 72 },
    { month: 'Sep', score: 70 },
    { month: 'Oct', score: 74 },
  ],
  reviews: [
    {
      id: 'rev-001',
      reviewerName: 'Sarah Connor',
      reviewerInitials: 'SC',
      reviewerColor: 'bg-emerald-600',
      starRating: 4,
      comment:
        'Alex consistently delivers high-quality work and collaborates well with the team. Needs to improve time management on high-priority tasks.',
      reviewPeriod: 'Oct 2026',
      createdAt: '2026-10-28T10:00:00Z',
    },
    {
      id: 'rev-002',
      reviewerName: 'David Kim',
      reviewerInitials: 'DK',
      reviewerColor: 'bg-indigo-600',
      starRating: 3,
      comment:
        'Good technical skills. The delivery pipeline work was solid. Focus on deadlines more carefully going forward.',
      reviewPeriod: 'Sep 2026',
      createdAt: '2026-09-30T09:00:00Z',
    },
    {
      id: 'rev-003',
      reviewerName: 'Elena Rostova',
      reviewerInitials: 'ER',
      reviewerColor: 'bg-rose-500',
      starRating: 4,
      comment:
        'Strong contributor this quarter. The product ops tasks were delivered ahead of schedule.',
      reviewPeriod: 'Aug 2026',
      createdAt: '2026-08-31T14:00:00Z',
    },
  ],
  improvementTips: [
    'Focus on completing tasks before their due dates to boost your on-time rate (currently lowest sub-score).',
    'Request feedback from your manager mid-sprint rather than only at review time.',
    'Break large tasks into smaller milestones to track progress more effectively.',
  ],
};
