import { useCallback, useEffect, useMemo, useState } from "react";
import { FaMedal, FaTrophy } from "react-icons/fa";
import { PageHeader } from "../components/common/AdminUI";
import { supabase } from "../supabase/config";
import { compareLeaderboardUsersForPeriod, getUsers, isLearner, leaderboardXp } from "../services/userService";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("Overall");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaderboard = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.filter(isLearner));
      setError("");
    } catch (requestError) {
      console.error(requestError);
      setError("Could not refresh the leaderboard. Showing the latest available results.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard(true);
    const channel = supabase.channel("admin-leaderboard-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadLeaderboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "module_progress" }, () => loadLeaderboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "exam_attempts" }, () => loadLeaderboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "driving_sessions" }, () => loadLeaderboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "study_activity" }, () => loadLeaderboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_achievements" }, () => loadLeaderboard())
      .subscribe();
    const refresh = window.setInterval(() => loadLeaderboard(), 30000);
    return () => { window.clearInterval(refresh); supabase.removeChannel(channel); };
  }, [loadLeaderboard]);

  const rankedUsers = useMemo(
    () => [...users].sort(compareLeaderboardUsersForPeriod(filter)),
    [users, filter],
  );
  if (loading) return <p>Loading leaderboard...</p>;
  const columns = ["Rank", "User", filter === "Overall" ? "XP" : `${filter} XP`, "Overall Progress", "Current Streak", "Written Exam Best", "Driving Best"];

  return <div className="space-y-6">
    <PageHeader title="Leaderboard" subtitle="Rank learners by experience, progress, exams, and driving performance." />
    <div className="flex gap-2">{["Overall", "This Week", "This Month"].map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 ${filter === item ? "bg-blue-600 text-white" : "border bg-white"}`}>{item}</button>)}</div>
    {error && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p>}
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><table className="w-full min-w-[950px]">
      <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>{columns.map(item => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead>
      <tbody>{rankedUsers.map((user, index) => <tr key={user.id} className={`border-t hover:bg-slate-50 ${index === 0 ? "bg-amber-50/40" : index === 1 ? "bg-slate-50/70" : index === 2 ? "bg-orange-50/30" : ""}`}>
        <td className="px-5 py-5"><span className="flex items-center gap-2 font-bold">{index < 3 ? index === 0 ? <FaTrophy className="text-amber-500" /> : <FaMedal className={index === 1 ? "text-slate-400" : "text-orange-600"} /> : null}#{index + 1}</span></td>
        <td className="px-5 py-5"><b>{user.name || "Unknown Player"}</b><p className="text-xs text-slate-500">{user.email}</p></td>
        <td className="px-5 py-5 font-bold text-blue-600">{leaderboardXp(user, filter)}</td><td className="px-5 py-5">{user.progress || 0}%</td><td className="px-5 py-5">{user.currentStreak || 0} days</td><td className="px-5 py-5">{user.examBestScore ?? "—"}</td><td className="px-5 py-5">{user.drivingBestScore ?? "—"}</td>
      </tr>)}</tbody>
    </table></div>
  </div>;
}
