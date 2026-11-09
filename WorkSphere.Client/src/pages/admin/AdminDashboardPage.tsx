import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { employeeService } from "../../services/employeeService";
import { taskService } from "../../services/taskService";
import type { Employee } from "../../types/employee";
import type { ApiTask } from "../../types/apiTask";
import { TaskStatCard } from "../../components/dashboard/TaskStatCard";
import {
  TasksIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  ArrowUpRightIcon,
} from "../../components/common/Icons";

// ── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ── Priority badge ────────────────────────────────────────────────────────────
const PRIORITY_BADGE: Record<string, string> = {
  Urgent: "bg-rose-100 text-rose-700",
  High: "bg-amber-100 text-amber-700",
  Medium: "bg-indigo-100 text-indigo-700",
  Low: "bg-slate-100 text-slate-600",
};

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  "In Progress": "bg-indigo-100 text-indigo-700",
  InProgress: "bg-indigo-100 text-indigo-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-slate-100 text-slate-600",
  Overdue: "bg-rose-100 text-rose-700",
  Blocked: "bg-purple-100 text-purple-700",
  Cancelled: "bg-purple-100 text-purple-700",
};

// ── Quick-action card ─────────────────────────────────────────────────────────
interface QuickActionCardProps {
  title: string;
  description: string;
  emoji: string;
  onClick: () => void;
  colorClass: string;
}

function QuickActionCard({
  title,
  description,
  emoji,
  onClick,
  colorClass,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 text-left transition-all duration-200 hover:shadow-md hover:border-indigo-200 w-full cursor-pointer"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${colorClass}`}
      >
        {emoji}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
          {title}
        </p>
        <p className="mt-0.5 text-sm text-slate-500 truncate">
          {" "}
          {description}{" "}
        </p>
      </div>
      <ArrowUpRightIcon
        size={16}
        className="ml-auto mt-1 shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors"
      />
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [empResult, taskResult] = await Promise.allSettled([
          employeeService.getAll(),
          taskService.getAll(),
        ]);

        if (empResult.status === "fulfilled" && Array.isArray(empResult.value)) {
          setEmployees(empResult.value);
        } else if (empResult.status === "rejected") {
          console.error("Failed to load employees for admin dashboard:", empResult.reason);
        }

        if (taskResult.status === "fulfilled" && Array.isArray(taskResult.value)) {
          setTasks(taskResult.value);
        } else if (taskResult.status === "rejected") {
          console.error("Failed to load tasks for admin dashboard:", taskResult.reason);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalEmployees = employees.length;
  const activeTasks = tasks.filter(
    (t) => t.status === "InProgress" || t.status === "In Progress",
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== "Completed" &&
      new Date(t.dueDate) < new Date(),
  ).length;

  // Last 5 tasks
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate))
      .slice(0, 5)
      .map((t) => {
        let status = t.status === "InProgress" ? "In Progress" : t.status;
        const isOverdue =
          t.dueDate &&
          status !== "Completed" &&
          new Date(t.dueDate) < new Date();
        if (isOverdue) {
          status = "Overdue";
        }

        return {
          id: `WS-${t.id}`,
          title: t.name,
          assignedTo: t.assignedToName || "Unassigned",
          priority: t.priority,
          status,
          dueDate: t.dueDate ? t.dueDate.split("T")[0] : "—",
        };
      });
  }, [tasks]);

  if (loading) {
    return <div className="p-6 text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {getGreeting()}, {user?.name ?? "Admin"}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's your team overview for today.
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TaskStatCard
          title="Total Employees"
          count={totalEmployees}
          subtitle="Team members in directory"
          icon={ClockIcon}
          variant="success"
        />
        <TaskStatCard
          title="Active Tasks"
          count={activeTasks}
          subtitle="Tasks currently in progress"
          icon={TasksIcon}
          variant="primary"
        />
        <TaskStatCard
          title="Completed Deliverables"
          count={completedTasks}
          subtitle="Tasks signed off"
          icon={CheckCircleIcon}
          variant="success"
        />
        <TaskStatCard
          title="Overdue Tasks"
          count={overdueTasks}
          subtitle="Tasks past their due date"
          icon={AlertCircleIcon}
          variant="danger"
        />
      </div>

      {/* ── Recently Assigned Tasks ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {" "}
              Recently Assigned Tasks{" "}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {" "}
              5 most recently created deliverables{" "}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/tasks")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            View All Tasks
            <ArrowUpRightIcon size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 text-left"> Task ID </th>
                <th className="px-6 py-3 text-left"> Title </th>
                <th className="px-6 py-3 text-left"> Assigned To </th>
                <th className="px-6 py-3 text-left"> Priority </th>
                <th className="px-6 py-3 text-left"> Status </th>
                <th className="px-6 py-3 text-left"> Due Date </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No deliverables recorded yet. Click "Create Task" above to assign work.
                  </td>
                </tr>
              ) : (
                recentTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {task.id}
                  </td>
                  <td className="px-6 py-3.5 max-w-[220px]">
                    <span
                      className="block truncate font-medium text-slate-800"
                      title={task.title}
                    >
                      {task.title}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">
                    {task.assignedTo}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        PRIORITY_BADGE[task.priority] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[task.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-3.5 text-xs whitespace-nowrap font-medium ${
                      task.status === "Overdue"
                        ? "text-rose-600"
                        : "text-slate-600"
                    }`}
                  >
                    {task.dueDate}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          {" "}
          Quick Actions{" "}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <QuickActionCard
            title="Create New Task"
            description="Assign task to team member"
            emoji="✏️"
            colorClass="bg-indigo-50 text-indigo-600"
            onClick={() => navigate("/admin/tasks/create")}
          />
          <QuickActionCard
            title="Directory"
            description="Manage employee accounts"
            emoji="👥"
            colorClass="bg-violet-50 text-violet-600"
            onClick={() => navigate("/admin/employees")}
          />
          <QuickActionCard
            title="Manage Reviews"
            description="Submit or review ratings"
            emoji="⭐"
            colorClass="bg-amber-50 text-amber-600"
            onClick={() => navigate("/admin/reviews")}
          />
          <QuickActionCard
            title="View Task List"
            description="Browse all deliverables"
            emoji="📋"
            colorClass="bg-emerald-50 text-emerald-600"
            onClick={() => navigate("/admin/tasks")}
          />
        </div>
      </div>
    </div>
  );
}
