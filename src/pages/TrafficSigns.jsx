import { FaExclamationTriangle, FaMapSigns, FaTrafficLight } from "react-icons/fa";
import CrudPage from "../components/common/CrudPage";

const categories = ["Regulatory", "Warning", "Guide", "Expressway", "RoadWork", "RoadMarking", "TrafficSignal", "HazardMarker"];

export default function TrafficSigns() {
  return <CrudPage config={{
    title: "Traffic Signs", subtitle: "Manage visual road-sign content shown in the learner application.", actionLabel: "Add Traffic Sign", itemName: "Traffic Sign", filters: categories,
    summary: [{ label: "Total Signs", count: (items) => items.length, icon: FaTrafficLight }, { label: "Regulatory", count: (items) => items.filter((item) => item.category === "Regulatory").length, icon: FaTrafficLight }, { label: "Warning", count: (items) => items.filter((item) => item.category === "Warning").length, icon: FaExclamationTriangle }, { label: "Other", count: (items) => items.filter((item) => !["Regulatory", "Warning"].includes(item.category)).length, icon: FaMapSigns }],
    columns: [{ key: "name", label: "Sign Name" }, { key: "category", label: "Category" }, { key: "meaning", label: "Meaning" }, { key: "status", label: "Status" }, { key: "updated", label: "Updated" }],
    fields: [{ key: "image", label: "Sign Image", type: "file" }, { key: "name", label: "Sign Name", required: true }, { key: "category", label: "Category", options: categories }, { key: "summary", label: "Summary", type: "textarea" }, { key: "meaning", label: "Meaning", type: "textarea", required: true }, { key: "driverAction", label: "What Driver Should Do", type: "textarea" }, { key: "source", label: "Official Source URL", type: "url" }, { key: "status", label: "Status", options: ["Draft", "Published"] }],
    emptyText: "Add your first traffic sign to start the visual learning library.",
  }} />;
}
