import { FaCheckCircle, FaClipboardCheck, FaClock, FaPercentage } from "react-icons/fa";
import CrudPage from "../components/common/CrudPage";

export default function WrittenExams() {
  return <CrudPage config={{
    title: "Written Exams", subtitle: "Manage the approved question-bank dataset used for grounded AI exams and offline fallback.", actionLabel: "Add Question", itemName: "Exam Question", filterKey: "examType", filters: ["Non-Professional", "Professional"],
    summary: [{ label: "Total Questions", count: (items) => items.length, icon: FaClipboardCheck }, { label: "Published", count: (items) => items.filter((item) => item.status === "Published").length, icon: FaCheckCircle }, { label: "Draft", count: (items) => items.filter((item) => item.status === "Draft").length, icon: FaClock }, { label: "Answer Choices", count: (items) => items.length * 4, icon: FaPercentage }],
    columns: [{ key: "question", label: "Question" }, { key: "category", label: "Category" }, { key: "difficulty", label: "Difficulty" }, { key: "correct", label: "Correct Answer" }, { key: "examType", label: "Exam Type" }, { key: "status", label: "Status" }, { key: "updated", label: "Updated" }],
    fields: [{ key: "examType", label: "Exam Type", options: ["Non-Professional", "Professional"] }, { key: "question", label: "Question", type: "textarea", required: true }, { key: "answerA", label: "Answer A", required: true }, { key: "answerB", label: "Answer B", required: true }, { key: "answerC", label: "Answer C", required: true }, { key: "answerD", label: "Answer D", required: true }, { key: "correct", label: "Correct Answer", options: ["A", "B", "C", "D"] }, { key: "category", label: "Category", required: true }, { key: "difficulty", label: "Difficulty", options: ["Easy", "Medium", "Hard"] }, { key: "explanation", label: "Explanation", type: "textarea" }, { key: "status", label: "Status", options: ["Draft", "Published"] }],
    emptyText: "Add the first written-exam question.",
  }} />;
}
