import { supabase } from "../supabase/config";
import { sanitizeFormValues, validateUpload } from "../utils/security";

const STORAGE_BUCKET = "admin-content";
const LESSON_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
]);

function normalizeLesson(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    status: row.status,
    fileName: row.file_name,
    fileType: row.file_type,
    fileURL: row.file_url,
    storagePath: row.storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function uploadLessonFile(file, previousPath = "") {
  if (!file) return null;
  validateUpload(file, { maximumBytes: 25 * 1024 * 1024, allowedMimeTypes: LESSON_TYPES });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `lessons/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  if (previousPath) await supabase.storage.from(STORAGE_BUCKET).remove([previousPath]);
  return {
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_url: data.publicUrl,
    storage_path: storagePath,
  };
}

export async function getLessons() {
  const { data, error } = await supabase.from("lessons").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeLesson);
}

export async function addLesson(data, file) {
  const clean = sanitizeFormValues(data);
  const upload = await uploadLessonFile(file);
  const { data: authData } = await supabase.auth.getUser();
  const payload = {
    title: clean.title,
    description: clean.description,
    category: clean.category,
    difficulty: clean.difficulty,
    status: clean.status,
    created_by: authData.user?.id || null,
    ...(upload || {}),
  };
  const { error } = await supabase.from("lessons").insert(payload);
  if (error) throw error;
}

export async function updateLesson(id, data, file, existing) {
  const clean = sanitizeFormValues(data);
  const upload = await uploadLessonFile(file, existing?.storagePath);
  const payload = {
    title: clean.title,
    description: clean.description,
    category: clean.category,
    difficulty: clean.difficulty,
    status: clean.status,
    ...(upload || {}),
  };
  const { error } = await supabase.from("lessons").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteLesson(lesson) {
  const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
  if (error) throw error;
  if (lesson.storagePath) await supabase.storage.from(STORAGE_BUCKET).remove([lesson.storagePath]);
}
