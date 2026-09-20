import { useEffect, useState } from "react";
import { FaChartLine, FaTrophy, FaUsers } from "react-icons/fa";
import { PageHeader, SummaryCards } from "../components/common/AdminUI";
import { getUsers, isLearner } from "../services/userService";

const modules = [
  ["Traffic Laws", "trafficLaws"],
  ["Traffic Signs", "trafficSigns"],
  ["License Codes", "licenseCodes"],
  ["Written Exam", "writtenExam"],
  ["Driving Simulation", "driving"],
];

export default function Progress() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers().then((data) => setUsers(data.filter(isLearner))).catch((requestError) => {
      console.error(requestError);
      setError("Unable to load learner progress.");
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8 text-slate-500">Loading progress...</p>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>;

  const average = users.length ? Math.round(users.reduce((total, user) => total + Number(user.progress || 0), 0) / users.length) : 0;
  const highest = users.length ? Math.max(...users.map((user) => Number(user.progress || 0))) : 0;
  const distribution = [["0–25%", 0, 25], ["26–50%", 26, 50], ["51–75%", 51, 75], ["76–99%", 76, 99], ["100%", 100, 100]]
    .map(([label, min, max]) => ({ label, count: users.filter((user) => Number(user.progress || 0) >= min && Number(user.progress || 0) <= max).length }));
  const moduleCompletion = modules.map(([label, key]) => ({
    label,
    value: users.length ? Math.round(users.reduce((total, user) => total + Number(user.moduleProgress[key] || 0), 0) / users.length) : 0,
  }));
  const allAttempts = users.flatMap((user) => user.examAttempts);
  const examPerformance = ["Non-Professional", "Professional"].map((name) => {
    const normalize = (value) => String(value || "").replaceAll(/[^a-z]/gi, "").toLowerCase();
    const attempts = allAttempts.filter((attempt) => {
      const type = normalize(attempt.exam_type) === "professional" ? "Professional" : "Non-Professional";
      return type === name;
    });
    return { name, attempts: attempts.length, rate: attempts.length ? Math.round(attempts.filter((attempt) => attempt.passed).length / attempts.length * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="User Progress" subtitle="Live learner performance across RuleCraft PH modules." />
      <SummaryCards items={[
        { label: "Total Players", value: users.length, icon: FaUsers },
        { label: "Average Progress", value: `${average}%`, icon: FaChartLine },
        { label: "Highest Progress", value: `${highest}%`, icon: FaTrophy },
      ]} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Progress Distribution">
          {distribution.map((item) => <Bar key={item.label} label={item.label} value={users.length ? Math.round(item.count / users.length * 100) : 0} suffix={`${item.count} users`} />)}
        </Panel>
        <Panel title="Module Completion">
          {moduleCompletion.map((item) => <Bar key={item.label} label={item.label} value={item.value} />)}
        </Panel>
      </div>
      <Panel title="Exam Performance">
        <div className="grid gap-4 md:grid-cols-2">
          {examPerformance.map((item) => <div key={item.name} className="rounded-xl bg-slate-50 p-5"><b>{item.name}</b><p className="mt-3 text-2xl font-bold text-blue-600">{item.rate}%</p><p className="text-sm text-slate-500">{item.attempts} completed attempts</p></div>)}
        </div>
      </Panel>
      <Panel title="Individual Progress">
        <div className="divide-y">
          {users.slice(0, 10).map((user) => <div className="flex items-center gap-4 py-4" key={user.id}><span className="w-48 truncate font-medium">{user.name || user.email}</span><div className="h-2 flex-1 rounded bg-slate-200"><div className="h-2 rounded bg-blue-600" style={{ width: `${user.progress || 0}%` }} /></div><b className="w-12 text-right">{user.progress || 0}%</b></div>)}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }) {
  return <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="mb-5 text-xl font-bold text-slate-800">{title}</h2>{children}</section>;
}

function Bar({ label, value, suffix }) {
  return <div className="mb-4"><div className="mb-2 flex justify-between text-sm"><span>{label}</span><b>{suffix || `${value}%`}</b></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-blue-600" style={{ width: `${value}%` }} /></div></div>;
}
