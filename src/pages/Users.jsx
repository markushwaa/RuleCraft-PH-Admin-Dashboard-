import { useEffect, useMemo, useState } from "react";
import { FaEllipsisV, FaSearch, FaUserCircle } from "react-icons/fa";
import { EmptyState, Modal, PageHeader, StatusBadge, fieldClass } from "../components/common/AdminUI";
import { getUsers, suspendUser } from "../services/userService";

const progressValue = (user, key) => user?.moduleProgress?.[key] ?? 0;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(null);
  const [detail, setDetail] = useState(null);
  const [suspending, setSuspending] = useState(null);

  const load = async () => {
    try { setUsers(await getUsers()); }
    catch (requestError) { console.error(requestError); setError("Unable to load user profiles."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  if (loading) return <p className="p-8 text-slate-500">Loading users...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Manage registered profiles and review learner histories." />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="relative border-b p-5"><FaSearch className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." className={`${fieldClass} pl-11`} /></div>
        <div className="overflow-x-auto">
          {filtered.length ? <table className="w-full min-w-[1300px]">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>{["User", "Email", "License Goal", "XP", "Overall Progress", "Written Exam", "Driving", "Last Active", "Status", "Actions"].map((label) => <th key={label} className="px-4 py-4">{label}</th>)}</tr></thead>
            <tbody>{filtered.map((user) => <tr key={user.id} className="border-t hover:bg-slate-50">
              <td className="px-4 py-4"><button onClick={() => setDetail(user)} className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{(user.name || "U").split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><b>{user.name || "Unknown User"}</b></button></td>
              <td className="px-4 py-4 text-sm">{user.email}</td><td className="px-4 py-4">{user.licenseGoal || "Not set"}</td><td className="px-4 py-4 font-semibold">{user.xp || 0}</td>
              <td className="px-4 py-4"><div className="w-28"><div className="mb-1 text-xs">{user.progress || 0}%</div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-blue-600" style={{ width: `${user.progress || 0}%` }} /></div></div></td>
              <td className="px-4 py-4"><StatusBadge>{user.examStatus || "Not Started"}</StatusBadge></td><td className="px-4 py-4"><StatusBadge>{user.drivingUnlocked ? "Unlocked" : "Locked"}</StatusBadge></td><td className="px-4 py-4 text-sm">{user.lastActive}</td><td className="px-4 py-4"><StatusBadge>{user.status}</StatusBadge></td>
              <td className="relative px-4 py-4"><button onClick={() => setMenu(menu === user.id ? null : user.id)} className="rounded-lg p-2 hover:bg-slate-100"><FaEllipsisV /></button>{menu === user.id && <div className="absolute right-12 top-10 z-20 w-52 rounded-xl border bg-white py-2 shadow-xl"><button onClick={() => { setDetail(user); setMenu(null); }} className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50">View Profile & Progress</button>{user.role === "learner" && user.status !== "suspended" && <button onClick={() => { setSuspending(user); setMenu(null); }} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Suspend User</button>}</div>}</td>
            </tr>)}</tbody>
          </table> : <EmptyState title="No users found" description="Registered users will appear here." />}
        </div>
      </div>

      {detail && <Modal title="User Details" onClose={() => setDetail(null)}>
        <div className="flex items-center gap-4 border-b pb-5"><FaUserCircle className="text-6xl text-blue-600" /><div><h3 className="text-xl font-bold">{detail.name}</h3><p className="text-slate-500">{detail.email}</p><StatusBadge>{detail.status}</StatusBadge></div></div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">{[["License Goal", detail.licenseGoal], ["Join Date", detail.joinDate], ["Last Active", detail.lastActive], ["XP", detail.xp || 0], ["Current Streak", detail.currentStreak || 0], ["Longest Streak", detail.longestStreak || 0]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-slate-500">{label}</p><b>{value || "Unavailable"}</b></div>)}</div>
        <h4 className="mt-6 font-bold">Learning Progress</h4>
        {[["Traffic Laws", "trafficLaws"], ["Traffic Signs", "trafficSigns"], ["License Codes", "licenseCodes"], ["Written Exam", "writtenExam"], ["Driving", "driving"]].map(([label, key]) => { const value = progressValue(detail, key); return <div key={key} className="mt-3"><div className="flex justify-between text-sm"><span>{label}</span><b>{value}%</b></div><div className="mt-1 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-blue-600" style={{ width: `${value}%` }} /></div></div>; })}
        <p className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">Best written exam: {detail.examBestScore ?? "No attempts"}% · Best driving score: {detail.drivingBestScore ?? "No sessions"}%</p>
        <h4 className="mt-6 font-bold">Recorded Scope Activity</h4>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          {[["Learning interactions", detail.contentInteractions.length], ["AI feedback messages", detail.aiMessages.filter((item) => item.message_role === "assistant").length], ["Completed quests", detail.questProgress.filter((item) => item.completed).length], ["Reviewer readiness records", detail.masteryCertificates.length]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-slate-500">{label}</p><b>{value}</b></div>)}
        </div>
      </Modal>}

      {suspending && <Modal title="Suspend user?" onClose={() => setSuspending(null)}><p>Suspending <b>{suspending.name}</b> blocks application access while preserving learner history.</p><div className="mt-6 flex justify-end gap-3"><button className="rounded-xl border px-5 py-3" onClick={() => setSuspending(null)}>Cancel</button><button className="rounded-xl bg-red-600 px-5 py-3 text-white" onClick={async () => { await suspendUser(suspending.id); setSuspending(null); await load(); }}>Suspend User</button></div></Modal>}
    </div>
  );
}
