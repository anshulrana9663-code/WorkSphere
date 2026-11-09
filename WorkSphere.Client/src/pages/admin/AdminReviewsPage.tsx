import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import { employeeService } from '../../services/employeeService';
import type { Review } from '../../types/review';
import type { Employee } from '../../types/employee';
import { CheckCircleIcon, AlertCircleIcon, TrashIcon } from '../../components/common/Icons';

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewPeriod, setReviewPeriod] = useState<string>('Nov 2026');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // History Filter
  const [filterEmpId, setFilterEmpId] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empsData, reviewsData] = await Promise.all([
        employeeService.getAll(),
        reviewService.getAll(),
      ]);
      const activeEmps = empsData.filter((e) => e.isActive);
      setEmployees(activeEmps);
      if (activeEmps.length > 0 && !selectedEmpId) {
        setSelectedEmpId(activeEmps[0].id.toString());
      }
      setReviews(reviewsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews and employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id.toString() === selectedEmpId);
  }, [employees, selectedEmpId]);

  const filteredReviews = useMemo(() => {
    if (filterEmpId === 'all') return reviews;
    return reviews.filter((r) => r.revieweeId.toString() === filterEmpId);
  }, [reviews, filterEmpId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback commentary for this review.');
      return;
    }
    if (!selectedEmpId) {
      setError('Please select an employee to review.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const newReview = await reviewService.create({
        revieweeId: parseInt(selectedEmpId, 10),
        starRating,
        comment: comment.trim(),
        reviewPeriod: reviewPeriod.trim() || 'Nov 2026',
      });

      setReviews((prev) => [newReview, ...prev]);
      setComment('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setFeedback('Review deleted successfully.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Employee Performance Reviews</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Submit star ratings and qualitative evaluations to shape team performance scores.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircleIcon size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Write Review Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Conduct Evaluation</h2>
              <p className="text-xs text-slate-400">Scores factor into employee 0–100 index</p>
            </div>
          </div>

          {submitted && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircleIcon size={16} className="text-emerald-600 shrink-0" />
              <span>Review successfully published and recorded!</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircleIcon size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee Selector */}
            <div>
              <label htmlFor="eval-emp" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Team Member
              </label>
              <select
                id="eval-emp"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.jobTitle} ({emp.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating Interactive Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Rating ({starRating} of 5 Stars)
              </label>
              <div className="flex items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || starRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setStarRating(star)}
                      className="text-2xl transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                      title={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <span className={isFilled ? 'text-amber-400' : 'text-slate-300'}>
                        ★
                      </span>
                    </button>
                  );
                })}
                <span className="ml-auto text-xs font-semibold text-slate-500">
                  {starRating === 5
                    ? 'Exceptional'
                    : starRating === 4
                    ? 'Strong Performer'
                    : starRating === 3
                    ? 'Meets Expectations'
                    : starRating === 2
                    ? 'Needs Improvement'
                    : 'Critical Concern'}
                </span>
              </div>
            </div>

            {/* Review Period */}
            <div>
              <label htmlFor="eval-period" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Review Period
              </label>
              <input
                id="eval-period"
                type="text"
                value={reviewPeriod}
                onChange={(e) => setReviewPeriod(e.target.value)}
                placeholder="e.g. Q4 2026 or Nov 2026"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Qualitative Feedback */}
            <div>
              <label htmlFor="eval-comment" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Qualitative Feedback &amp; Development Goals
              </label>
              <textarea
                id="eval-comment"
                rows={4}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Detail technical strengths, sprint contributions, and growth areas..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {submitting ? 'Submitting Review...' : 'Submit & Apply Review'}
            </button>
          </form>
        </div>

        {/* Right column: Review History List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Review History</h2>
              <p className="text-xs text-slate-500">Historical performance assessments</p>
            </div>

            {/* Filter by Employee */}
            <div className="w-full sm:w-48">
              <select
                value={filterEmpId}
                onChange={(e) => setFilterEmpId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Employees ({reviews.length})</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id.toString()}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading review records...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <p className="text-sm font-medium">No reviews logged for this team member.</p>
                <p className="text-xs mt-1">Submit your first review on the left panel.</p>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors bg-white space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-indigo-600">
                        {rev.revieweeInitials || 'EM'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {rev.revieweeName}
                        </p>
                        <p className="text-xs text-slate-400">
                          Reviewed by {rev.reviewerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center text-amber-400 text-sm">
                        {'★'.repeat(rev.starRating)}
                        <span className="text-slate-200">
                          {'★'.repeat(5 - rev.starRating)}
                        </span>
                      </div>
                      <span className="mt-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {rev.reviewPeriod}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete Review"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
