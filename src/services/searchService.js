import { getContentItems } from "./contentService";
import { getLessons } from "./lessonService";
import { getUsers } from "./userService";

const emptyResults = () => ({
  users: [],
  lessons: [],
  trafficLaws: [],
  trafficSigns: [],
  licenseCodes: [],
  examQuestions: [],
});

function filterItems(items, keyword, fields) {
  return items.filter((item) => fields.some((field) => String(item[field] || "").toLowerCase().includes(keyword)));
}

export async function globalSearch(searchText) {
  const keyword = searchText.trim().toLowerCase();
  if (!keyword) return emptyResults();

  try {
    const [users, lessons, trafficLaws, trafficSigns, licenseCodes, examQuestions] = await Promise.all([
      getUsers(),
      getLessons(),
      getContentItems("trafficLaws"),
      getContentItems("trafficSigns"),
      getContentItems("licenseCodes"),
      getContentItems("examQuestions"),
    ]);

    return {
      users: filterItems(users, keyword, ["name", "email"]),
      lessons: filterItems(lessons, keyword, ["title", "category"]),
      trafficLaws: filterItems(trafficLaws, keyword, ["title", "category", "reference"]),
      trafficSigns: filterItems(trafficSigns, keyword, ["name", "category", "meaning"]),
      licenseCodes: filterItems(licenseCodes, keyword, ["code", "category", "description"]),
      examQuestions: filterItems(examQuestions, keyword, ["question", "category", "examType"]),
    };
  } catch (error) {
    console.error("Supabase global search failed:", error);
    return emptyResults();
  }
}
