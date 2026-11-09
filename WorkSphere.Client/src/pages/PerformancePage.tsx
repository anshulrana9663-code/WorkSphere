import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';
import { MOCK_PERFORMANCE_DATA } from '../mock/mockPerformanceData';
import type { ReviewEntry } from '../mock/mockPerformanceData';
import {
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
} from '../components/common/Icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-500';
  return 'text-rose-500';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return '#10b981'; // emerald-500
  if (score >= 60) return '#f59e0b'; // amber-400
  return '#f43f5e'; // rose-500
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Work';
}

// ─── Score Gauge ─────────────────────────────────────────────────────────────

interface ScoreGaugeProps {
  score: number;
}

function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Use 75% of circle (270°) as the arc
  const arcFraction = 0.75;
  const dashTotal = circumference * arcFraction;
  const dashFill = dashTotal * (score / 100);
  const dashGap = circumference - dashTotal;
  const rotation = 135; // start from bottom-left

  const ringColor = getScoreRingColor(score);
  const textColor = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <svg
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="overflow-visible"
        >
          {/* Track */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
            strokeDasharray={`${dashTotal} ${dashGap}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${radius} ${radius})`}
          />
          {/* Fill */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeDasharray={`${dashFill} ${circumference - dashFill}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${radius} ${radius})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
          <span className="text-xs text-slate-500 font-medium">{getScoreLabel(score)}</span>
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-700">Performance Score</p>

      {/* Trend badge */}
      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
        <ArrowUpIcon size={12} />
        +4 pts this month
      </span>

      {/* Weight labels */}
      <p className="mt-3 text-xs text-slate-400 text-center leading-relaxed">
        Completion&nbsp;<span className="font-semibold text-slate-500">40%</span>&nbsp;·&nbsp;
        On-Time&nbsp;<span className="font-semibold text-slate-500">35%</span>&nbsp;·&nbsp;
        Reviews&nbsp;<span className="font-semibold text-slate-500">25%</span>
      </p>
    </div>
  );
}

// ─── Sub-Score Row ────────────────────────────────────────────────────────────

interface SubScoreRowProps {
  label: string;
  weight: string;
  value: number; // 0-100
  color: string;
  description: string;
}

function SubScoreRow({ label, weight, value, color, description }: SubScoreRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800">{label}</span>
          <span className="text-slate-400 font-medium">({weight})</span>
        </div>
        <span className="font-bold text-slate-900">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-600">{description}</p>
    </div>
  );
}

// ─── Star Rating Display ──────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-amber-400' : 'text-slate-200'}>
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewEntry }) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${review.reviewerColor}`}
          >
            {review.reviewerInitials}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">{review.reviewerName}</p>
            <p className="text-[11px] text-slate-600">
              {review.reviewPeriod} · {formattedDate}
            </p>
          </div>
        </div>
        <StarRating rating={review.starRating} />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
    </div>
  );
}

// ─── Tip Icon ─────────────────────────────────────────────────────────────────

function LightbulbIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-sm">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-indigo-600 font-bold">{payload[0].value} pts</p>
      </div>
    );
  }
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const { user } = useAuth();
  const [liveReviews, setLiveReviews] = useState<ReviewEntry[]>([]);
  const [taskStats, setTaskStats] = useState<{ completed: number; total: number; completionRate: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPerformance() {
      if (!user?.id) return;
      const empId = parseInt(user.id, 10);
      if (isNaN(empId)) return;

      try {
        setLoading(true);
        const summary = await reviewService.getEmployeePerformance(empId);
        if (summary) {
          setTaskStats({
            completed: summary.totalTasksCompleted,
            total: summary.totalTasksAssigned,
            completionRate: Math.round(summary.completionRate),
          });

          if (summary.reviews && summary.reviews.length > 0) {
            setLiveReviews(
              summary.reviews.map((r) => ({
                id: r.id.toString(),
                reviewerName: r.reviewerName || 'Engineering Lead',
                reviewerInitials: r.reviewerName
                  ? r.reviewerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'SC',
                reviewerColor: 'bg-emerald-600',
                starRating: r.starRating,
                comment: r.comment,
                reviewPeriod: r.reviewPeriod,
                createdAt: r.createdAt,
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Could not fetch real performance data, using baseline mock:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPerformance();
  }, [user?.id]);

  const { score: defaultScore, monthlyTrend, improvementTips } = MOCK_PERFORMANCE_DATA;

  const displayReviews = liveReviews;

  const calculatedScore = useMemo(() => {
    if (taskStats) {
      const avgReviewScore = liveReviews.length > 0
        ? Math.round(
            (liveReviews.reduce((sum, r) => sum + r.starRating, 0) / liveReviews.length) * 20
          )
        : 80;
      const completionRate = taskStats.completionRate;
      const onTimeRate = 85; // Baseline
      const overall = Math.round(completionRate * 0.4 + onTimeRate * 0.35 + avgReviewScore * 0.25);
      return {
        overall: Math.min(100, Math.max(0, overall)),
        completionRate,
        onTimeRate,
        reviewScore: avgReviewScore,
      };
    }
    return defaultScore;
  }, [taskStats, liveReviews, defaultScore]);

  const subScores = [
    {
      label: 'Task Completion Rate',
      weight: '40%',
      value: calculatedScore.completionRate,
      color: 'bg-emerald-500',
      description: 'Tasks completed vs. total assigned',
    },
    {
      label: 'On-Time Delivery',
      weight: '35%',
      value: calculatedScore.onTimeRate,
      color: 'bg-indigo-500',
      description: 'Tasks closed on or before the due date',
    },
    {
      label: 'Reviewer Feedback Score',
      weight: '25%',
      value: calculatedScore.reviewScore,
      color: 'bg-amber-500',
      description: 'Weighted average from managerial star ratings',
    },
  ];

  const lowestIdx = subScores.reduce(
    (minI, s, i, arr) => (s.value < arr[minI].value ? i : minI),
    0
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Performance &amp; Reviews</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your performance index, historical ratings, and growth milestones.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
          <ActivityIcon size={14} className="text-indigo-600" />
          <span>Last updated today</span>
        </div>
      </div>

      {/* ── Section 1: Score Gauge & Breakdown (2-col) ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Gauge card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={calculatedScore.overall} />
        </div>

        {/* Breakdown card (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between gap-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Score Breakdown</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              How your 0–100 index is calculated across delivery pillars
            </p>
          </div>

          <div className="space-y-4">
            {subScores.map((s) => (
              <SubScoreRow key={s.label} {...s} />
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex items-center justify-between text-xs text-slate-600">
            <span>Formula: 40% Completion + 35% On-Time + 25% Reviews</span>
            <span className="font-bold text-slate-800">{calculatedScore.overall} / 100</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: 6-Month Trend Chart ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Performance Trend</h2>
          <p className="text-xs text-slate-500 mt-0.5">6-month performance history</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366F1"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#6366F1', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Section 3 & 4: Reviews + Tips (2-col on large) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Review History */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Review History</h2>
            <p className="text-xs text-slate-500 mt-0.5">{displayReviews.length} reviews on record</p>
          </div>
          <div className="flex flex-col gap-3">
            {displayReviews.length === 0 ? (
              <div className="py-8 text-center rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-700">No performance reviews recorded yet</p>
                <p className="text-xs text-slate-500 mt-1">Periodic reviews and ratings submitted by leadership will appear here.</p>
              </div>
            ) : (
              displayReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Improvement Tips</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized based on your lowest sub-score
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {improvementTips.map((tip, idx) => {
              const isHighlighted = idx === lowestIdx;
              return (
                <div
                  key={idx}
                  className={`flex gap-3 rounded-xl p-3.5 border transition-colors ${
                    isHighlighted
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <span
                    className={`shrink-0 mt-0.5 ${
                      isHighlighted ? 'text-amber-500' : 'text-indigo-400'
                    }`}
                  >
                    <LightbulbIcon />
                  </span>
                  <p
                    className={`text-sm leading-relaxed ${
                      isHighlighted
                        ? 'text-amber-800 font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    {tip}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            {[
              {
                label: 'Tasks Done',
                value: taskStats ? `${taskStats.completed} / ${taskStats.total}` : '41 / 50',
                color: 'text-emerald-600',
              },
              {
                label: 'On Time',
                value: '36 / 50',
                color: 'text-amber-500',
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
