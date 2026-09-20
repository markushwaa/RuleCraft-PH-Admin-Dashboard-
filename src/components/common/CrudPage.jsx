import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArchive, FaEdit, FaEye, FaSearch, FaTrash } from "react-icons/fa";
import { archiveContentItem, createContentItem, deleteContentItem, getContentItems, updateContentItem } from "../../services/contentService";
import { EmptyState, Modal, PageHeader, StatusBadge, SummaryCards, fieldClass } from "./AdminUI";

const collections = {
  "Traffic Laws": "trafficLaws",
  "Traffic Signs": "trafficSigns",
  "License Codes": "licenseCodes",
  "Written Exams": "examQuestions",
  Achievements: "achievements",
  Announcements: "announcements",
};

export default function CrudPage({ config }) {
  const collectionName = config.collectionName || collections[config.title];
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setItems(await getContentItems(collectionName));
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load data. Check the connection and administrator permissions.");
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter((item) =>
    (filter === "All" || item[config.filterKey || "category"] === filter) &&
    Object.values(item).some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
  ), [items, search, filter, config.filterKey]);
  const summary = config.summary.map((summaryItem) => ({
    ...summaryItem,
    value: summaryItem.count ? summaryItem.count(items) : items.filter((item) => item.status === summaryItem.label).length,
  }));

  const openEditor = (item) => {
    setEditing(item);
    setImagePreview(item?.imageURL || "");
    setError("");
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      if (editing?.id) await updateContentItem(collectionName, editing.id, values, editing);
      else await createContentItem(collectionName, values);
      setEditing(null);
      setImagePreview("");
      await load();
    } catch (requestError) {
      console.error(requestError);
      setError(`Unable to save this record: ${requestError.message || "check required fields and permissions."}`);
    } finally {
      setSaving(false);
    }
  };

  const archive = async (item) => {
    try {
      await archiveContentItem(collectionName, item.id);
      await load();
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to archive this record.");
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await deleteContentItem(collectionName, deleting);
      setDeleting(null);
      await load();
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to delete this record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={config.title} subtitle={config.subtitle} action={() => openEditor({ status: "Draft" })} actionLabel={config.actionLabel} />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <SummaryCards items={summary} />
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row">
          <div className="relative flex-1"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${fieldClass} pl-11`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} /></div>
          {config.filters && <select className={`${fieldClass} md:w-56`} value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{config.filters.map((value) => <option key={value}>{value}</option>)}</select>}
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="py-16 text-center text-slate-500">Loading {config.title.toLowerCase()}...</div> : filtered.length ? (
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr>{config.columns.map((column) => <th className="px-5 py-4" key={column.key}>{column.label}</th>)}<th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody>{filtered.map((item) => <tr key={item.id} className="border-t hover:bg-slate-50">{config.columns.map((column) => <td className="px-5 py-4 text-sm text-slate-700" key={column.key}>{column.key === "status" ? <StatusBadge>{item[column.key]}</StatusBadge> : column.key === "image" && item.imageURL ? <img src={item.imageURL} alt="" className="h-12 w-12 rounded-lg object-contain" /> : item[column.key] || "—"}</td>)}<td className="px-5 py-4"><div className="flex justify-end gap-2"><button title="Preview" onClick={() => setPreview(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><FaEye /></button><button title="Edit" onClick={() => openEditor(item)} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"><FaEdit /></button><button title="Archive" onClick={() => archive(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><FaArchive /></button><button title="Delete" onClick={() => setDeleting(item)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><FaTrash /></button></div></td></tr>)}</tbody>
            </table>
          ) : <EmptyState title={`No ${config.title.toLowerCase()} yet`} description={config.emptyText} action={() => openEditor({ status: "Draft" })} actionLabel={config.actionLabel} />}
        </div>
        {filtered.length > 0 && <div className="border-t px-5 py-4 text-sm text-slate-500">Showing {filtered.length} records</div>}
      </div>

      {editing && <Modal title={`${editing.id ? "Edit" : "Add"} ${config.itemName}`} onClose={() => setEditing(null)}><form onSubmit={save} className="space-y-4">{config.fields.map((field) => <label className="block" key={field.key}><span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}{field.required && " *"}</span>{field.type === "textarea" ? <textarea className={fieldClass} rows="4" name={field.key} defaultValue={editing[field.key]} required={field.required} /> : field.options ? <select className={fieldClass} name={field.key} defaultValue={editing[field.key] || field.options[0]}>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input className={fieldClass} name={field.key} type={field.type || "text"} defaultValue={field.type === "file" ? undefined : editing[field.key]} required={field.required && !editing.imageURL} onChange={field.type === "file" ? (event) => { const file = event.target.files?.[0]; setImagePreview(file ? URL.createObjectURL(file) : editing.imageURL || ""); } : undefined} />}{field.type === "file" && imagePreview && <img src={imagePreview} alt="Selected preview" className="mt-3 h-36 w-full rounded-xl border bg-slate-50 object-contain p-2" />}</label>)}<div className="flex justify-end gap-3 pt-3"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-5 py-3">Cancel</button><button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">{saving ? "Saving..." : `Save ${config.itemName}`}</button></div></form></Modal>}
      {preview && <Modal title={`${config.itemName} Preview`} onClose={() => setPreview(null)}>{preview.imageURL && <img src={preview.imageURL} alt="" className="mb-6 h-48 w-full object-contain" />}<dl className="space-y-4">{config.fields.filter((field) => field.type !== "file").map((field) => <div key={field.key}><dt className="text-xs font-bold uppercase text-slate-400">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-700">{preview[field.key] || "—"}</dd></div>)}</dl></Modal>}
      {deleting && <Modal title={`Delete ${config.itemName}?`} onClose={() => setDeleting(null)}><p className="text-slate-600">This may affect historical learner data. Archive or unpublish this record when possible.</p><div className="mt-6 flex justify-end gap-3"><button className="rounded-xl border px-5 py-3" onClick={() => setDeleting(null)}>Cancel</button><button disabled={saving} className="rounded-xl bg-red-600 px-5 py-3 text-white" onClick={remove}>{saving ? "Deleting..." : "Delete permanently"}</button></div></Modal>}
    </div>
  );
}
