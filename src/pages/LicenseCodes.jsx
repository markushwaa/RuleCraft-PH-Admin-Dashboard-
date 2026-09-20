import { FaCheckCircle, FaIdCard, FaMotorcycle, FaTruck } from "react-icons/fa";
import CrudPage from "../components/common/CrudPage";

export default function LicenseCodes() {
  return <CrudPage config={{
    title: "License Codes", subtitle: "Manage Philippine driver-license vehicle classifications.", actionLabel: "Add License Code", itemName: "License Code",
    summary: [{ label: "Total Codes", count: (items) => items.length, icon: FaIdCard }, { label: "Published", count: (items) => items.filter((item) => item.status === "Published").length, icon: FaCheckCircle }, { label: "Motorcycle Codes", count: (items) => items.filter((item) => /^A/.test(item.code)).length, icon: FaMotorcycle }, { label: "Heavy Vehicle Codes", count: (items) => items.filter((item) => /C|D|E/.test(item.code)).length, icon: FaTruck }],
    columns: [{ key: "code", label: "Code" }, { key: "category", label: "Vehicle Category" }, { key: "description", label: "Description" }, { key: "classes", label: "Vehicle Classes" }, { key: "status", label: "Status" }, { key: "updated", label: "Updated" }],
    fields: [{ key: "code", label: "Code", required: true }, { key: "category", label: "Vehicle Category", required: true }, { key: "description", label: "Description", type: "textarea", required: true }, { key: "classes", label: "Vehicle Classes (one CODE: description per line)", type: "textarea" }, { key: "status", label: "Status", options: ["Draft", "Published"] }],
    emptyText: "Add the first license code used by the learner application.",
  }} />;
}
