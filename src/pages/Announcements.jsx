import { FaBullhorn, FaCalendarAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import CrudPage from "../components/common/CrudPage";

export default function Announcements() {
  return <CrudPage config={{
    title: "Announcements", subtitle: "Create targeted notices for RuleCraft PH learners.", actionLabel: "Create Announcement", itemName: "Announcement",
    summary: [{ label: "Total", count: (items) => items.length, icon: FaBullhorn }, { label: "Published", count: (items) => items.filter((item) => item.status === "Published").length, icon: FaCheckCircle }, { label: "Draft", count: (items) => items.filter((item) => item.status === "Draft").length, icon: FaClock }, { label: "Scheduled", count: (items) => items.filter((item) => item.status === "Scheduled").length, icon: FaCalendarAlt }],
    columns: [{ key: "title", label: "Title" }, { key: "message", label: "Message" }, { key: "audience", label: "Audience" }, { key: "publishDate", label: "Publish Date" }, { key: "status", label: "Status" }],
    fields: [{ key: "title", label: "Title", required: true }, { key: "message", label: "Message", type: "textarea", required: true }, { key: "audience", label: "Audience", options: ["All Users", "Student Permit", "Non-Professional", "Professional"] }, { key: "publishDate", label: "Publish Date", type: "date" }, { key: "status", label: "Status", options: ["Draft", "Scheduled", "Published", "Expired"] }],
    emptyText: "Create the first announcement for your learners.",
  }} />;
}
