import React, { useState, useEffect, useMemo } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Activity,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data.data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const analytics = useMemo(() => {
    if (!dashboardData) return { chartData: [], stats: [] };

    // Use activityStats (full 7 days) if available, otherwise fallback to recentActivity
    const { documents = [], quizzes = [] } =
      dashboardData.activityStats || dashboardData.recentActivity || {};

    const allActivity = [
      ...documents.map((d) => ({
        ...d,
        date: new Date(d.lastAccessed || d.createdAt || Date.now()),
        type: "doc",
      })),
      ...quizzes.map((q) => ({
        ...q,
        date: new Date(q.completedAt || q.createdAt || Date.now()),
        type: "quiz",
      })),
    ];

    // 1. Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      return moment()
        .subtract(6 - i, "days")
        .format("YYYY-MM-DD");
    });

    const chartData = last7Days.map((dateStr) => {
      const dayActivity = allActivity.filter(
        (a) => moment(a.date).format("YYYY-MM-DD") === dateStr,
      );
      return {
        date: moment(dateStr).format("ddd"), // Mon, Tue...
        docs: dayActivity.filter((a) => a.type === "doc").length,
        quizzes: dayActivity.filter((a) => a.type === "quiz").length,
        total: dayActivity.length,
      };
    });

    // 2. Calculate Trends (This week vs Total roughly)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newDocsThisWeek = documents.filter(
      (d) => new Date(d.lastAccessed || d.createdAt) > oneWeekAgo,
    ).length;
    const newQuizzesThisWeek = quizzes.filter(
      (q) => new Date(q.completedAt || q.createdAt) > oneWeekAgo,
    ).length;

    return {
      chartData,
      trends: {
        docs: newDocsThisWeek,
        quizzes: newQuizzesThisWeek,
      },
    };
  }, [dashboardData]);

  const allActivities = useMemo(() => {
    if (!dashboardData?.recentActivity) return [];
    const { documents = [], quizzes = [] } = dashboardData.recentActivity;
    return [
      ...documents.map((d) => ({
        ...d,
        type: "doc",
        date: new Date(d.lastAccessed || d.createdAt || Date.now()),
      })),
      ...quizzes.map((q) => ({
        ...q,
        type: "quiz",
        date: new Date(q.completedAt || q.createdAt || Date.now()),
      })),
    ].sort((a, b) => b.date - a.date);
  }, [dashboardData]);

  if (loading) {
    return <Spinner />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      color: "blue",
      trend: `+${analytics.trends?.docs || 0} this week`,
      link: "/documents",
    },
    {
      label: "Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      color: "purple",
      trend: "Active Learning",
      link: "/flashcards",
    },
    {
      label: "Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      color: "emerald",
      trend: `+${analytics.trends?.quizzes || 0} this week`,
      link: "/documents",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-500",
        light: "bg-blue-50",
        border: "border-blue-100",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-500",
        light: "bg-purple-50",
        border: "border-purple-100",
      },
      emerald: {
        bg: "bg-emerald-500",
        text: "text-emerald-500",
        light: "bg-emerald-50",
        border: "border-emerald-100",
      },
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Overall Progress
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track your learning journey and improvements
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600">
            {moment().format("MMMM D, YYYY")}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <Link key={index} to={stat.link} className="block group">
              <div className="relative h-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${colors.light} ${colors.text} ring-1 ring-inset ${colors.border}`}
                  >
                    <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${colors.light} ${colors.text}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>

                <div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>

                {/* Decorative BG Icon */}
                <stat.icon
                  className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] ${colors.text} transform -rotate-12`}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Middle Section: Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Weekly Learning Activity
              </h3>
              <p className="text-sm text-slate-500">
                Documents and Quizzes activity over last 7 days
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.chartData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{
                    color: "#0f172a",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Mini List (Top 5) */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Recent Activity
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 max-h-[340px]">
            {allActivities.length > 0 ? (
              allActivities.slice(0, 5).map((item, i) => (
                <Link
                  key={i}
                  to={
                    item.type === "doc"
                      ? `/documents/${item._id}`
                      : `/quizzes/${item._id}`
                  }
                  className="flex items-center gap-4 group"
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.type === "doc" ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"}`}
                  >
                    {item.type === "doc" ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <BrainCircuit className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {moment(item.date).fromNow()}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                No recent activity
              </p>
            )}
          </div>
          <button
            onClick={() => setShowActivityModal(true)}
            className="mt-4 pt-4 border-t border-slate-100 text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 w-full"
          >
            View All Activity
          </button>
        </div>
      </div>

      {/* Recent Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                All Recent Activity
              </h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-4">
                {allActivities.length > 0 ? (
                  allActivities.map((item, i) => (
                    <Link
                      key={i}
                      to={
                        item.type === "doc"
                          ? `/documents/${item._id}`
                          : `/quizzes/${item._id}`
                      }
                      className="flex items-center gap-4 group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                      onClick={() => setShowActivityModal(false)}
                    >
                      <div
                        className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.type === "doc" ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"}`}
                      >
                        {item.type === "doc" ? (
                          <FileText className="w-6 h-6" />
                        ) : (
                          <BrainCircuit className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.type === "doc" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {item.type === "doc" ? "Document" : "Quiz"}
                          </span>
                          <span className="text-xs text-slate-500">
                            • {moment(item.date).format("MMM D, h:mm A")}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-12">
                    No activity found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
