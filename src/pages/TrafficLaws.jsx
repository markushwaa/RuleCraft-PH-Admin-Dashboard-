import { FaArchive, FaBalanceScale, FaCheckCircle, FaClock } from "react-icons/fa";
import CrudPage from "../components/common/CrudPage";

export default function TrafficLaws() {
  return <CrudPage config={{
    title: "Traffic Laws", subtitle: "Manage traffic law educational content shown in the RuleCraft PH learner app.", actionLabel: "Add Traffic Law", itemName: "Traffic Law",
    filters: ["Speed", "Vehicle & License", "Overtaking", "Driver Safety", "Right of Way", "Road Safety", "Motorcycle", "Parking"],
    summary: [{ label: "Total Laws", count: (items) => items.length, icon: FaBalanceScale }, { label: "Published", icon: FaCheckCircle }, { label: "Draft", icon: FaClock }, { label: "Archived", icon: FaArchive }],
    columns: [{ key: "title", label: "Law Title" }, { key: "category", label: "Category" }, { key: "reference", label: "Legal Reference" }, { key: "status", label: "Status" }, { key: "updated", label: "Last Updated" }],
    fields: [{ key: "title", label: "Title", required: true }, { key: "category", label: "Category", required: true }, { key: "reference", label: "Legal Reference", required: true }, { key: "overview", label: "Overview", type: "textarea", required: true }, { key: "keyPoints", label: "What You Need to Know", type: "textarea" }, { key: "tip", label: "Driver Tip", type: "textarea" }, { key: "source", label: "Official Source URL", type: "url" }, { key: "status", label: "Status", options: ["Draft", "Published"] }],
    emptyText: "Add your first traffic law to make it available in the learner application.",
  }} />;
}
