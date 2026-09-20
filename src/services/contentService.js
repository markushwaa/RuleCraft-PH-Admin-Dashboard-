import { supabase } from "../supabase/config";
import { sanitizeFormValues, sanitizePlainText, validateUpload } from "../utils/security";

const STORAGE_BUCKET = "admin-content";
const LETTERS = ["A", "B", "C", "D"];
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function examTypeLabel(value) {
  const normalized = String(value || "").replaceAll(/[^a-z]/gi, "").toLowerCase();
  if (normalized === "professional") return "Professional";
  return "Non-Professional";
}

function examTypeValue(value) {
  return examTypeLabel(value) === "Professional" ? "Professional" : "NonProfessional";
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function publishedStatus(row, enabled = "Published", disabled = "Draft") {
  return row.is_published ? enabled : disabled;
}

function slug(value, fallback = "record") {
  const normalized = String(value || fallback)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
  return normalized || fallback;
}

function uniqueTextId(value) {
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${slug(value)}-${suffix}`;
}

function storagePathFromUrl(url) {
  if (!url) return "";
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  return index < 0 ? "" : decodeURIComponent(url.slice(index + marker.length));
}

function normalizeBase(row, idColumn = "id") {
  return {
    id: row[idColumn],
    updated: formatDate(row.updated_at || row.created_at),
  };
}

function parseVehicleClasses(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      return separator > 0
        ? { class_code: line.slice(0, separator).trim(), description: line.slice(separator + 1).trim() }
        : { class_code: line, description: "" };
    });
}

function formatVehicleClasses(classes) {
  if (!Array.isArray(classes)) return "";
  return classes.map((item) => `${item.class_code || ""}${item.description ? `: ${item.description}` : ""}`).join("\n");
}

function announcementStatus(row) {
  if (!row.is_published) return "Draft";
  const now = Date.now();
  if (row.ends_at && new Date(row.ends_at).getTime() < now) return "Expired";
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return "Scheduled";
  return "Published";
}

const configurations = {
  trafficLaws: {
    table: "traffic_laws",
    labelField: "title",
    fromRow: (row) => ({
      ...normalizeBase(row),
      title: row.title,
      category: row.category,
      reference: row.legal_reference,
      overview: row.summary,
      keyPoints: row.details,
      tip: row.practical_guidance,
      source: row.official_source_url,
      status: publishedStatus(row),
    }),
    toRow: (values) => ({
      title: values.title,
      category: values.category,
      legal_reference: values.reference,
      summary: values.overview,
      details: values.keyPoints,
      practical_guidance: values.tip,
      official_source_url: values.source,
      is_published: values.status === "Published",
    }),
  },
  trafficSigns: {
    table: "traffic_signs",
    labelField: "name",
    imageColumn: "image_url",
    fromRow: (row) => ({
      ...normalizeBase(row),
      name: row.name,
      category: row.category,
      summary: row.short_meaning,
      meaning: row.detailed_explanation || row.short_meaning,
      driverAction: row.driver_action,
      source: row.official_source_url,
      imageURL: row.image_url,
      storagePath: storagePathFromUrl(row.image_url),
      status: publishedStatus(row),
    }),
    toRow: (values) => ({
      name: values.name,
      category: values.category,
      short_meaning: values.summary || values.meaning,
      detailed_explanation: values.meaning,
      driver_action: values.driverAction,
      official_source_url: values.source,
      image_url: values.imageURL,
      is_published: values.status === "Published",
    }),
  },
  licenseCodes: {
    table: "license_codes",
    idColumn: "code",
    labelField: "code",
    imageColumn: "image_url",
    fromRow: (row) => ({
      ...normalizeBase(row, "code"),
      code: row.code,
      category: row.title,
      description: row.short_description,
      classes: formatVehicleClasses(row.vehicle_classes),
      imageURL: row.image_url,
      storagePath: storagePathFromUrl(row.image_url),
      status: publishedStatus(row),
    }),
    toRow: (values) => ({
      code: values.code,
      title: values.category,
      short_description: values.description,
      vehicle_classes: parseVehicleClasses(values.classes),
      image_url: values.imageURL,
      is_published: values.status === "Published",
    }),
  },
  examQuestions: {
    table: "written_exam_questions",
    labelField: "question",
    fromRow: (row) => ({
      ...normalizeBase(row),
      question: row.question_text,
      answerA: row.choices?.[0] || "",
      answerB: row.choices?.[1] || "",
      answerC: row.choices?.[2] || "",
      answerD: row.choices?.[3] || "",
      correct: LETTERS[row.correct_answer_index] || "A",
      category: row.category,
      difficulty: row.difficulty,
      explanation: row.explanation,
      examType: examTypeLabel(row.exam_types?.[0]),
      status: publishedStatus(row),
    }),
    toRow: (values) => ({
      question_text: values.question,
      choices: [values.answerA, values.answerB, values.answerC, values.answerD],
      correct_answer_index: Math.max(0, LETTERS.indexOf(values.correct)),
      explanation: values.explanation,
      category: values.category,
      difficulty: values.difficulty,
      exam_types: values.examType ? [examTypeValue(values.examType)] : [],
      is_published: values.status === "Published",
    }),
  },
  achievements: {
    table: "achievements",
    labelField: "name",
    fromRow: (row) => ({
      ...normalizeBase(row),
      name: row.title,
      description: row.description,
      requirement: `${row.achievement_type}: ${row.requirement_value}`,
      xp: row.xp_reward,
      earned: row.earned || 0,
      status: publishedStatus(row, "Enabled", "Disabled"),
    }),
    toRow: (values) => {
      const match = String(values.requirement || "").match(/^(.*?)(?::\s*)?(\d+)$/);
      return {
        title: values.name,
        description: values.description,
        achievement_type: slug(match?.[1] || values.requirement || "general", "general"),
        requirement_value: Number(match?.[2] || 1),
        xp_reward: Number(values.xp || 0),
        is_published: values.status === "Enabled",
      };
    },
  },
  announcements: {
    table: "announcements",
    serverId: true,
    labelField: "title",
    fromRow: (row) => ({
      ...normalizeBase(row),
      title: row.title,
      message: row.message,
      audience: row.audience === "all" ? "All Users" : row.audience,
      publishDate: row.starts_at?.slice(0, 10) || "",
      status: announcementStatus(row),
    }),
    toRow: (values) => ({
      title: values.title,
      message: values.message,
      audience: values.audience === "All Users" ? "all" : values.audience,
      starts_at: values.publishDate ? `${values.publishDate}T00:00:00` : new Date().toISOString(),
      ends_at: values.status === "Expired" ? new Date().toISOString() : null,
      is_published: values.status !== "Draft",
    }),
  },
  drivingScenarios: {
    table: "driving_scenarios",
    labelField: "name",
    imageColumn: "preview_image_url",
    fromRow: (row) => ({
      ...normalizeBase(row),
      key: row.id === "rainy-road" ? "rainy" : row.environment_id || row.id.replace(/-driving$/, ""),
      name: row.title,
      description: row.description,
      difficulty: row.difficulty,
      imageURL: row.preview_image_url,
      storagePath: storagePathFromUrl(row.preview_image_url),
      attempts: row.attempts || 0,
      averageScore: row.averageScore ?? "No data",
      status: publishedStatus(row),
    }),
    toRow: (values) => ({
      title: values.name,
      description: values.description,
      difficulty: values.difficulty,
      environment_id: values.key === "rainy" ? "rainy-road" : values.key,
      preview_image_url: values.imageURL,
      is_published: values.status === "Published",
    }),
    createId: (values) => values.key === "rainy" ? "rainy-road" : `${values.key}-driving`,
  },
};

function getConfiguration(collectionName) {
  const configuration = configurations[collectionName];
  if (!configuration) throw new Error(`Unsupported Supabase content collection: ${collectionName}`);
  return { idColumn: "id", ...configuration };
}

async function enrichItems(collectionName, rows) {
  if (collectionName === "achievements") {
    const { data, error } = await supabase.from("user_achievements").select("achievement_id");
    if (error) throw error;
    const counts = (data || []).reduce((result, item) => {
      result[item.achievement_id] = (result[item.achievement_id] || 0) + 1;
      return result;
    }, {});
    return rows.map((row) => ({ ...row, earned: counts[row.id] || 0 }));
  }

  if (collectionName === "drivingScenarios") {
    const { data, error } = await supabase.from("driving_sessions")
      .select("scenario_id, final_score, attempt_status");
    if (error) throw error;
    return rows.map((row) => {
      const sessions = (data || []).filter((session) => session.scenario_id === row.id);
      const scoredSessions = sessions.filter((session) => session.attempt_status !== "in_progress");
      return {
        ...row,
        attempts: sessions.length,
        averageScore: scoredSessions.length
          ? Math.round(scoredSessions.reduce((total, session) => total + Number(session.final_score || 0), 0) / scoredSessions.length)
          : null,
      };
    });
  }

  return rows;
}

export async function getContentItems(collectionName) {
  const configuration = getConfiguration(collectionName);
  const { data, error } = await supabase
    .from(configuration.table)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const currentRows = collectionName === "drivingScenarios"
    ? (data || []).filter((row) => row.id !== "highway-driving" && row.environment_id !== "highway")
    : (data || []);
  const enriched = await enrichItems(collectionName, currentRows);
  return enriched.map(configuration.fromRow);
}

async function uploadImage(collectionName, values, existing) {
  const image = Object.values(values).find(
    (value) => typeof File !== "undefined" && value instanceof File && value.size > 0,
  );
  if (!image) return { imageURL: existing?.imageURL || "", storagePath: existing?.storagePath || "" };
  validateUpload(image, { maximumBytes: 5 * 1024 * 1024, allowedMimeTypes: IMAGE_TYPES });

  const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${collectionName}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, image, {
    contentType: image.type || undefined,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  if (existing?.storagePath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([existing.storagePath]);
  }
  return { imageURL: data.publicUrl, storagePath };
}

async function preparePayload(collectionName, values, existing = {}) {
  const configuration = getConfiguration(collectionName);
  const plainValues = Object.fromEntries(
    Object.entries(values).filter(([, value]) => !(typeof File !== "undefined" && value instanceof File)),
  );
  const uploaded = configuration.imageColumn
    ? await uploadImage(collectionName, values, existing)
    : { imageURL: existing.imageURL || "" };
  const payload = configuration.toRow({ ...sanitizeFormValues(plainValues), ...uploaded });
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

export async function createContentItem(collectionName, values) {
  const configuration = getConfiguration(collectionName);
  const payload = await preparePayload(collectionName, values);

  if (!configuration.serverId) {
    payload[configuration.idColumn] = configuration.createId
      ? configuration.createId(values)
      : configuration.idColumn === "code"
        ? sanitizePlainText(values.code, 40).toUpperCase()
        : uniqueTextId(values[configuration.labelField]);
  }
  if (collectionName === "announcements") {
    const { data } = await supabase.auth.getUser();
    payload.created_by = data.user?.id || null;
  }

  const { data, error } = await supabase
    .from(configuration.table)
    .insert(payload)
    .select(configuration.idColumn)
    .single();
  if (error) throw error;
  return data[configuration.idColumn];
}

export async function updateContentItem(collectionName, id, values, existing) {
  const configuration = getConfiguration(collectionName);
  const payload = await preparePayload(collectionName, values, existing);
  const { error } = await supabase
    .from(configuration.table)
    .update(payload)
    .eq(configuration.idColumn, id);
  if (error) throw error;
}

export async function archiveContentItem(collectionName, id) {
  const configuration = getConfiguration(collectionName);
  const archivedStatus = collectionName === "achievements" ? "Disabled" : "Draft";
  const payload = configuration.toRow({ status: archivedStatus });
  const statusPayload = Object.fromEntries(
    Object.entries(payload).filter(([key]) => ["is_published", "ends_at"].includes(key)),
  );
  const { error } = await supabase
    .from(configuration.table)
    .update(statusPayload)
    .eq(configuration.idColumn, id);
  if (error) throw error;
}

export async function deleteContentItem(collectionName, item) {
  const configuration = getConfiguration(collectionName);
  const { error } = await supabase
    .from(configuration.table)
    .delete()
    .eq(configuration.idColumn, item.id);
  if (error) throw error;
  if (item.storagePath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([item.storagePath]);
  }
}
