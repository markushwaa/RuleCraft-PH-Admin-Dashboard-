import { FaInbox, FaPlus, FaTimes } from "react-icons/fa";

export function PageHeader({ title, subtitle, action, actionLabel = "Add Item" }) {
  return <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-3 h-1 w-10 rounded-full bg-blue-600"/><h1 className="text-3xl font-bold tracking-tight text-slate-800">{title}</h1><p className="mt-2 max-w-3xl text-slate-500">{subtitle}</p></div>{action && <button onClick={action} className="primary-button inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700"><FaPlus />{actionLabel}</button>}</div>;
}

export function SummaryCards({ items }) {
  const tones = { blue:"bg-blue-50 text-blue-600", green:"bg-emerald-50 text-emerald-600", purple:"bg-violet-50 text-violet-600", orange:"bg-amber-50 text-amber-600" }; return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value, icon: Icon, color = "blue" }) => <div key={label} className="admin-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 truncate text-3xl font-bold tracking-tight text-slate-800">{value}</p></div>{Icon && <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[color] || tones.blue}`}><Icon className="text-xl" /></div>}</div></div>)}</div>;
}

export function StatusBadge({ children }) {
  const value = String(children || "Draft");
  const tone = /published|active|passed|unlocked|enabled/i.test(value) ? "bg-green-100 text-green-700" : /failed|suspended|expired/i.test(value) ? "bg-red-100 text-red-700" : /draft|progress|scheduled/i.test(value) ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{value}</span>;
}

export function EmptyState({ title, description, action, actionLabel }) {
  return <div className="py-16 text-center"><FaInbox className="mx-auto text-4xl text-slate-300"/><h3 className="mt-4 font-bold text-slate-800">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>{action && <button onClick={action} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">{actionLabel}</button>}</div>;
}

export function Modal({ title, children, onClose, footer }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4"><h2 className="text-xl font-bold text-slate-800">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><FaTimes /></button></div><div className="p-6">{children}</div>{footer && <div className="flex justify-end gap-3 border-t px-6 py-4">{footer}</div>}</div></div>;
}

export const fieldClass = "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
