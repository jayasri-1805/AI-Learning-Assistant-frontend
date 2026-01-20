import React, { useState, useEffect } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data__getDashboardData", data);

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
      label: "Total Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
      link: "/documents",
    },
    {
      label: "Total Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/25",
      link: "/flashcards",
    },
    {
      label: "Total Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
      link: "/documents",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              Track your learning progress and activity
            </p>
          </div>
          <div className="text-xs md:text-sm font-medium text-slate-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 shadow-xs self-start md:self-auto">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <Link to={stat.link} key={index} className="block h-full">
              <div className="group relative bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform translate-x-1/4 -translate-y-1/4">
                  <stat.icon
                    className={`w-24 h-24 md:w-32 md:h-32 text-${stat.gradient.split("-")[1]}-500`}
                  />
                </div>

                <div className="relative z-10 flex items-start justify-between mb-6 md:mb-8">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-4 ring-white`}
                  >
                    <stat.icon
                      className="w-5 h-5 md:w-6 md:h-6 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 md:p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <Clock
                  className="w-5 h-5 md:w-6 md:h-6 text-slate-600"
                  strokeWidth={2}
                />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  Recent Activity
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  Your latest learning interactions
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {dashboardData.recentActivity &&
            (dashboardData.recentActivity.documents.length > 0 ||
              dashboardData.recentActivity.quizzes.length > 0) ? (
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-1 md:pr-2 space-y-3 md:space-y-4">
                {[
                  ...(dashboardData.recentActivity.documents || []).map(
                    (doc) => ({
                      id: doc._id,
                      title: doc.title,
                      timestamp: doc.lastAccessed,
                      link: `/documents/${doc._id}`,
                      type: "Document",
                      icon: FileText,
                    }),
                  ),
                  ...(dashboardData.recentActivity.quizzes || []).map(
                    (quiz) => ({
                      id: quiz._id,
                      title: quiz.title,
                      timestamp: quiz.completedAt,
                      link: `/quizzes/${quiz._id}`,
                      type: "Quiz",
                      icon: BrainCircuit,
                    }),
                  ),
                ]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((activity, index) => (
                    <Link
                      key={activity.id || index}
                      to={activity.link}
                      className="group flex items-center justify-between p-4 md:p-5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 md:gap-5 overflow-hidden flex-1">
                        <div
                          className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                            activity.type === "Document"
                              ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                              : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                          }`}
                        >
                          <activity.icon
                            className="w-5 h-5 md:w-6 md:h-6"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm md:text-base font-semibold text-slate-900 truncate">
                            {activity.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-md ${
                                activity.type === "Document"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {activity.type}
                            </span>
                            <span className="text-[10px] md:text-xs font-medium text-slate-400 truncate">
                              • {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Button */}
                      <div className="hidden sm:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-200 ml-4">
                        View Details
                      </div>

                      {/* Mobile Arrow */}
                      <div className="sm:hidden text-slate-400 group-hover:text-slate-600 ml-2">
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 md:py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-50 mb-4 md:mb-6 border border-slate-100">
                  <Clock className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2">
                  No activity yet
                </h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Start analyzing documents or taking quizzes to see your
                  learning journey here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
