import { useEffect, useState } from "react";
import { FaBalanceScale, FaCar, FaClipboardCheck, FaIdCard, FaTrafficLight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/common/AdminUI";
import { getContentItems } from "../services/contentService";

const definitions = [
  { name: "Traffic Laws", path: "/traffic-laws", icon: FaBalanceScale, collection: "trafficLaws" },
  { name: "Traffic Signs", path: "/traffic-signs", icon: FaTrafficLight, collection: "trafficSigns" },
  { name: "License Codes", path: "/license-codes", icon: FaIdCard, collection: "licenseCodes" },
  { name: "Written Exams", path: "/written-exams", icon: FaClipboardCheck, collection: "examQuestions" },
  { name: "Driving Scenarios", path: "/driving-scenarios", icon: FaCar, collection: "drivingScenarios" },
];

export default function ContentManagement() {
  const [counts, setCounts] = useState({});
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all(definitions.map(async (item) => [item.collection, await getContentItems(item.collection)]))
      .then((results) => setCounts(Object.fromEntries(results)))
      .catch((requestError) => { console.error(requestError); setError("Unable to load content totals."); });
  }, []);
  return <div className="space-y-6"><PageHeader title="Learning Content" subtitle="Manage RuleCraft PH learning materials." />{error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{definitions.map(({ name, path, icon: Icon, collection }) => { const records = counts[collection] || []; return <div key={name} className="admin-card rounded-2xl border bg-white p-6 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600"><Icon /></div><h2 className="mt-5 text-xl font-bold">{name}</h2><div className="mt-4 flex justify-between text-sm text-slate-500"><span>{records.length} records</span><span>{records.filter((item) => item.status === "Published").length} published</span></div><Link className="mt-6 block rounded-xl bg-blue-600 px-4 py-3 text-center text-white hover:bg-blue-700" to={path}>Manage</Link></div>; })}</div></div>;
}
