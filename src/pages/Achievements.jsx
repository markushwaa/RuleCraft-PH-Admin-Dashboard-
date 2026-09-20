import { useCallback, useEffect, useMemo, useState } from "react";
import { FaAward, FaCertificate, FaCheckCircle, FaStar, FaUsers } from "react-icons/fa";
import CrudPage from "../components/common/CrudPage";
import { getMasteryCertificates } from "../services/masteryService";
import { supabase } from "../supabase/config";

function certificateLabel(value) {
  return value === "PDC_READINESS" ? "PDC Reviewer Preparedness" : "TDC Reviewer Preparedness";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

export default function Achievements() {
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [certificateError, setCertificateError] = useState("");
  const loadCertificates = useCallback(async () => {
    try {
      setCertificates(await getMasteryCertificates());
      setCertificateError("");
    } catch (error) {
      console.error(error);
      setCertificateError("Unable to load mastery certificates. Check administrator permissions and the database connection.");
    } finally {
      setLoadingCertificates(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
    const channel = supabase.channel("admin-mastery-certificates-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "mastery_certificates" }, loadCertificates)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadCertificates]);

  const counts = useMemo(() => ({
    all: certificates.length,
    tdc: certificates.filter((item) => item.certificate_type === "TDC_READINESS").length,
    pdc: certificates.filter((item) => item.certificate_type === "PDC_READINESS").length,
  }), [certificates]);

  return <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Reviewer Readiness & Achievements</h1>
      <p className="mt-2 text-slate-500">Monitor reviewer-based preparedness and manage achievement rewards. These records are not official certifications.</p>
    </div>

    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FaCertificate /></span>
          <div><h2 className="text-xl font-bold text-slate-800">Learner Readiness Records</h2><p className="text-sm text-slate-500">Automatically recorded when a learner meets RuleCraft reviewer goals.</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Total Issued", counts.all], ["TDC Readiness", counts.tdc], ["PDC Readiness", counts.pdc]].map(([label, value]) =>
          <div className="rounded-xl bg-slate-50 p-4" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-800">{value}</p></div>)}
      </div>
      {certificateError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{certificateError}</div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        {loadingCertificates ? <div className="py-12 text-center text-slate-500">Loading certificates...</div> : certificates.length ?
          <table className="w-full min-w-[850px]">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Learner</th><th className="px-5 py-4">Certificate</th><th className="px-5 py-4">Certificate Number</th><th className="px-5 py-4">Issued</th><th className="px-5 py-4">Status</th></tr></thead>
            <tbody>{certificates.map((item) => <tr className="border-t" key={item.id}><td className="px-5 py-4"><p className="font-semibold text-slate-800">{item.learnerName}</p><p className="text-xs text-slate-500">{item.learnerEmail}</p></td><td className="px-5 py-4 text-sm">{certificateLabel(item.certificate_type)}</td><td className="px-5 py-4 font-mono text-sm">{item.certificate_number}</td><td className="px-5 py-4 text-sm">{formatDate(item.issued_at)}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Reviewer readiness only</span></td></tr>)}</tbody>
          </table> : <div className="py-12 text-center text-slate-500">No mastery certificates have been issued yet.</div>}
      </div>
      <p className="text-xs font-semibold text-amber-800">RuleCraft is only a reviewer. Learners must complete official training and examinations through an LTO Driver Education Center or LTO-accredited driving school and follow the appropriate LTO process to obtain genuine certification.</p>
    </section>

    <CrudPage config={{
    title: "Achievements", subtitle: "Configure learner milestones and XP rewards.", actionLabel: "Add Achievement", itemName: "Achievement",
    summary: [{ label: "Total", count: (items) => items.length, icon: FaAward }, { label: "Enabled", count: (items) => items.filter((item) => item.status === "Enabled").length, icon: FaCheckCircle }, { label: "Users Earned", count: (items) => items.reduce((total, item) => total + Number(item.earned || 0), 0), icon: FaUsers }, { label: "XP Available", count: (items) => items.reduce((total, item) => total + Number(item.xp || 0), 0), icon: FaStar }],
    columns: [{ key: "name", label: "Achievement" }, { key: "description", label: "Description" }, { key: "requirement", label: "Requirement" }, { key: "xp", label: "XP Reward" }, { key: "earned", label: "Users Earned" }, { key: "status", label: "Status" }],
    fields: [{ key: "name", label: "Achievement", required: true }, { key: "description", label: "Description", type: "textarea", required: true }, { key: "requirement", label: "Requirement (type: value)", required: true }, { key: "xp", label: "XP Reward", type: "number" }, { key: "status", label: "Status", options: ["Enabled", "Disabled"] }],
    emptyText: "Add an achievement to reward learner progress.",
    }} />
  </div>;
}
