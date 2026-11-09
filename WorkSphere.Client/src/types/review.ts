export interface Review {
  id: number;
  revieweeId: number;
  revieweeName: string;
  revieweeInitials: string;
  reviewerId: number;
  reviewerName: string;
  starRating: number; // 1–5
  comment: string;
  reviewPeriod: string; // e.g. "Nov 2026"
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  revieweeId: number;
  starRating: number;
  comment: string;
  reviewPeriod: string;
}

export interface UpdateReviewRequest {
  starRating: number;
  comment: string;
  reviewPeriod: string;
}

export interface EmployeePerformanceSummary {
  employeeId: number;
  employeeName: string;
  averageRating: number;
  totalReviews: number;
  totalTasksAssigned: number;
  totalTasksCompleted: number;
  completionRate: number;
  reviews: Review[];
}

