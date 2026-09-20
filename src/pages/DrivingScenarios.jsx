import { useEffect, useState } from "react";
import { FaCar, FaCloudRain, FaMoon } from "react-icons/fa";
import { Modal, PageHeader, StatusBadge, fieldClass } from "../components/common/AdminUI";
import { createContentItem, getContentItems, updateContentItem } from "../services/contentService";
import { supabase } from "../supabase/config";

const scenarioDefinitions = [
  { key: "city", name: "City Driving", icon: FaCar, description: "Urban intersections, traffic lights, and pedestrian awareness.", difficulty: "Medium" },
  { key: "night", name: "Night Driving", icon: FaMoon, description: "Visibility, awareness, and safe driving after dark.", difficulty: "Medium" },
  { key: "rainy", name: "Rainy Road", icon: FaCloudRain, description: "Reduced grip, braking distance, and wet-weather safety.", difficulty: "Hard" },
];

export default function DrivingScenarios() {
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try { setRecords(await getContentItems("drivingScenarios")); }
    catch (requestError) { console.error(requestError); setError("Unable to load driving scenarios."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    let refreshTimer;
    const scheduleLoad = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(load, 250);
    };
    const channel = supabase.channel("admin-driving-scenarios-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "driving_sessions" }, scheduleLoad)
      .on("postgres_changes", { event: "*", schema: "public", table: "driving_scenarios" }, scheduleLoad)
      .subscribe();
    const fallbackRefresh = window.setInterval(load, 30000);
    return () => {
      window.clearTimeout(refreshTimer);
      window.clearInterval(fallbackRefresh);
      supabase.removeChannel(channel);
    };
  }, []);

  const scenarios = scenarioDefinitions.map((definition) => ({ ...definition, ...(records.find((record) => record.key === definition.key) || {}) }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      if (editing.id) await updateContentItem("drivingScenarios", editing.id, values, editing);
      else await createContentItem("drivingScenarios", values);
      setEditing(null);
      await load();
    } catch (requestError) {
      console.error(requestError);
      setError(`Unable to save this scenario: ${requestError.message}`);
    } finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <PageHeader title="Driving Scenarios" subtitle="Manage simulation details and monitor learner results." />
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
    <div className="space-y-5">{scenarios.map(({ icon: Icon, ...item }) => <div key={item.key} className="admin-card flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center"><div className="flex h-28 w-full items-center justify-center rounded-xl bg-slate-100 text-4xl text-blue-600 md:w-44">{item.imageURL ? <img src={item.imageURL} alt="" className="h-full w-full rounded-xl object-cover" /> : <Icon />}</div><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold text-slate-800">{item.name}</h2><StatusBadge>{item.status || "Draft"}</StatusBadge></div><p className="mt-2 text-slate-500">{item.description}</p><div className="mt-4 flex flex-wrap gap-6 text-sm"><span><b>Difficulty:</b> {item.difficulty}</span><span><b>Attempts:</b> {item.attempts ?? 0}</span><span><b>Average score:</b> {item.averageScore == null ? "No data" : `${item.averageScore}%`}</span></div></div><button onClick={() => setEditing(item)} className="rounded-xl border border-blue-600 px-5 py-3 text-blue-600 hover:bg-blue-50">Edit</button></div>)}</div>
    {loading && <p className="text-slate-500">Loading scenario data...</p>}
    {editing && <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}><form className="space-y-4" onSubmit={save}><input type="hidden" name="key" value={editing.key} />{[["name", "Scenario Name"], ["description", "Description"], ["difficulty", "Difficulty"]].map(([key, label]) => <label className="block" key={key}><span className="mb-2 block text-sm font-semibold">{label}</span><input className={fieldClass} name={key} defaultValue={editing[key]} required /></label>)}<label className="block"><span className="mb-2 block text-sm font-semibold">Status</span><select className={fieldClass} name="status" defaultValue={editing.status || "Draft"}><option>Draft</option><option>Published</option></select></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-5 py-3">Cancel</button><button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 text-white">{saving ? "Saving..." : "Save Scenario"}</button></div></form></Modal>}
  </div>;
}
