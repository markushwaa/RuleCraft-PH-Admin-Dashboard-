import { useEffect, useState } from "react";
import { FaBookOpen, FaCertificate, FaChartLine, FaClipboardCheck, FaFileAlt, FaFire, FaGamepad, FaPercentage, FaRobot, FaTasks, FaUsers } from "react-icons/fa";
import AnalyticsChart from "../components/dashboard/AnalyticsChart";
import LeaderboardCard from "../components/dashboard/LeaderboardCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import StatCard from "../components/dashboard/StatCard";
import { getDashboardAnalytics } from "../services/analyticsService";
import { supabase } from "../supabase/config";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let refreshTimer;
    const load = () => getDashboardAnalytics().then((result) => {
      if (active) { setAnalytics(result); setError(""); }
    }).catch((requestError) => {
      console.error(requestError);
      if (active) setError("Unable to load dashboard analytics.");
    });
    const scheduleLoad = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(load, 250);
    };
    load();
    const channel = supabase.channel("admin-dashboard-live");
    ["profiles", "module_progress", "exam_attempts", "driving_sessions", "study_activity",
      "user_achievements", "learner_quest_progress", "mastery_certificates",
      "content_interactions", "ai_messages"].forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleLoad);
    });
    channel.subscribe();
    const fallbackRefresh = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      window.clearInterval(fallbackRefresh);
      supabase.removeChannel(channel);
    };
  }, []);

  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>;
  if (!analytics) return <div className="p-8 text-slate-500">Loading dashboard...</div>;

  const { stats } = analytics;
  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: FaUsers, color: "blue" },
    { title: "Active Players", value: stats.activePlayers, icon: FaGamepad, color: "green" },
    { title: "Written Exams Taken", value: stats.examAttempts, icon: FaClipboardCheck, color: "purple" },
    { title: "Completion Rate", value: `${stats.completion}%`, icon: FaChartLine, color: "orange" },
    { title: "Exam Pass Rate", value: `${stats.examPassRate}%`, icon: FaPercentage, color: "green" },
    { title: "Driving Sessions", value: stats.drivingSessions, icon: FaGamepad, color: "blue" },
    { title: "Published Content", value: stats.publishedContent, icon: FaFileAlt, color: "purple" },
    { title: "Active Streaks", value: stats.activeStreaks, icon: FaFire, color: "orange" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-slate-500">Live RuleCraft PH platform overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => <StatCard key={item.title} {...item} />)}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-800">Scope Activity Monitoring</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Learning Interactions" value={analytics.scopeMetrics.contentInteractions} icon={FaBookOpen} color="blue" />
          <StatCard title="AI Feedback Given" value={analytics.scopeMetrics.aiFeedback} icon={FaRobot} color="green" />
          <StatCard title="Quests Completed" value={analytics.scopeMetrics.completedQuests} icon={FaTasks} color="purple" />
          <StatCard title="Readiness Records" value={analytics.scopeMetrics.masteryCertificates} icon={FaCertificate} color="orange" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Learning Module Engagement</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">Average completion across registered learners.</p>
          {analytics.moduleEngagement.map(({ name, value }) => (
            <div className="mb-4" key={name}>
              <div className="flex justify-between text-sm"><span>{name}</span><b>{value}%</b></div>
              <div className="mt-2 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-blue-600" style={{ width: `${value}%` }} /></div>
            </div>
          ))}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Written Exam Performance</h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">Completed attempts and pass rates by exam type.</p>
          <div className="space-y-4">
            {analytics.examPerformance.map(({ name, attempts, passRate }) => (
              <div key={name} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <b>{name}</b><div className="text-right text-sm"><p>{attempts} attempts</p><p className="font-bold text-green-600">{passRate}% pass rate</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-slate-800">User Growth Analytics</h2>
        <p className="mb-5 text-sm text-slate-500">New learner profiles created per month.</p>
        <AnalyticsChart data={analytics.growth} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-800">Top 5 Players</h2>
          <div className="space-y-4">
            {analytics.topPlayers.length ? analytics.topPlayers.map((player, index) => (
              <LeaderboardCard key={player.id} rank={index + 1} name={player.name} xp={player.xp} level={player.level} />
            )) : <p className="text-slate-500">No leaderboard data.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-800">Recent Activity</h2>
          <RecentActivity activities={analytics.recentActivity} />
        </section>
      </div>
    </div>
  );
}
