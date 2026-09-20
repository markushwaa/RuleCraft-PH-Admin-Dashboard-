import { supabase } from "../supabase/config";

const MODULE_KEYS = {
  "traffic-law": "trafficLaws",
  "traffic-signs": "trafficSigns",
  "license-code": "licenseCodes",
  "written-exam": "writtenExam",
  "driving-simulation": "driving",
};

function formatDate(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unavailable"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function metric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isLearner(user) {
  return String(user?.role || "").trim().toLowerCase() === "learner";
}

export function compareLeaderboardUsers(a, b) {
  return metric(b.xp) - metric(a.xp)
    || metric(b.progress) - metric(a.progress)
    || metric(b.examBestScore) - metric(a.examBestScore)
    || metric(b.drivingBestScore) - metric(a.drivingBestScore)
    || metric(b.currentStreak) - metric(a.currentStreak)
    || String(a.name || "").localeCompare(String(b.name || ""));
}

function periodStart(period) {
  const now = new Date();
  if (period === "This Week") {
    const start = new Date(now);
    const weekday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - weekday);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (period === "This Month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

export function leaderboardXp(user, period = "Overall") {
  const start = periodStart(period);
  if (!start) return metric(user.xp);
  const inPeriod = (value) => value && new Date(value) >= start;
  const examXp = (user.examAttempts || [])
    .filter((attempt) => inPeriod(attempt.completed_at))
    .reduce((total, attempt) => total + (attempt.passed ? 50 : 10), 0);
  const drivingXp = (user.drivingSessions || [])
    .filter((session) => inPeriod(session.completed_at) && session.completed)
    .reduce((total, session) => total + (Number(session.final_score || 0) >= 75 ? 75 : 25), 0);
  const studyXp = (user.studyActivities || [])
    .filter((activity) => inPeriod(activity.created_at))
    .reduce((total, activity) => total + Math.max(0, metric(activity.xp_earned)), 0);
  const achievementXp = (user.achievementAwards || [])
    .filter((award) => inPeriod(award.unlocked_at))
    .reduce((total, award) => total + Math.max(0, metric(award.achievements?.xp_reward)), 0);
  return examXp + drivingXp + studyXp + achievementXp;
}

export function compareLeaderboardUsersForPeriod(period) {
  return (a, b) => leaderboardXp(b, period) - leaderboardXp(a, period)
    || compareLeaderboardUsers(a, b);
}

export async function getUsers() {
  const [profilesResult, progressResult, examsResult, drivingResult, studyResult, awardsResult,
    questsResult, certificatesResult, interactionsResult, aiMessagesResult] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("module_progress").select("*"),
    supabase.from("exam_attempts").select("*"),
    supabase.from("driving_sessions").select("*"),
    supabase.from("study_activity").select("*"),
    supabase.from("user_achievements").select("*, achievements(xp_reward)"),
    supabase.from("learner_quest_progress").select("*"),
    supabase.from("mastery_certificates").select("*"),
    supabase.from("content_interactions").select("id, user_id, content_type, content_id, action, occurred_at"),
    supabase.from("ai_messages").select("id, user_id, message_role, created_at"),
  ]);

  for (const result of [profilesResult, progressResult, examsResult, drivingResult, studyResult,
    awardsResult, questsResult, certificatesResult, interactionsResult, aiMessagesResult]) {
    if (result.error) throw result.error;
  }

  return (profilesResult.data || []).map((profile) => {
    const progressRows = (progressResult.data || []).filter((row) => row.user_id === profile.id);
    const moduleProgress = progressRows.reduce((result, row) => {
      result[MODULE_KEYS[row.module_id] || row.module_id] = row.completion_percent;
      return result;
    }, {});
    const examAttempts = (examsResult.data || []).filter((row) => row.user_id === profile.id);
    const drivingSessions = (drivingResult.data || []).filter((row) => row.user_id === profile.id);
    const studyActivities = (studyResult.data || []).filter((row) => row.user_id === profile.id);
    const achievementAwards = (awardsResult.data || []).filter((row) => row.user_id === profile.id);
    const questProgress = (questsResult.data || []).filter((row) => row.user_id === profile.id);
    const masteryCertificates = (certificatesResult.data || []).filter((row) => row.user_id === profile.id);
    const contentInteractions = (interactionsResult.data || []).filter((row) => row.user_id === profile.id);
    const aiMessages = (aiMessagesResult.data || []).filter((row) => row.user_id === profile.id);

    return {
      id: profile.id,
      name: profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unknown User",
      email: profile.email,
      role: profile.role,
      licenseGoal: profile.license_goal,
      xp: profile.xp,
      level: Math.floor(Math.max(0, metric(profile.xp)) / 500) + 1,
      progress: profile.progress_percent,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      drivingUnlocked: profile.driving_unlocked,
      examStatus: profile.exam_status,
      status: profile.status,
      joinDate: formatDate(profile.created_at),
      lastActive: formatDate(profile.last_active_at),
      createdAt: profile.created_at,
      lastActiveAt: profile.last_active_at,
      moduleProgress,
      examAttempts,
      drivingSessions,
      studyActivities,
      achievementAwards,
      questProgress,
      masteryCertificates,
      contentInteractions,
      aiMessages,
      examBestScore: examAttempts.length ? Math.max(...examAttempts.map((attempt) => Number(attempt.percentage || 0))) : null,
      drivingBestScore: drivingSessions.length ? Math.max(...drivingSessions.map((session) => Number(session.final_score || 0))) : null,
    };
  });
}

// Browser clients must never receive a Supabase service-role key. Suspending the
// profile blocks mobile/admin access through RLS; deleting Auth users belongs in
// a trusted Edge Function if permanent account deletion is added later.
export async function suspendUser(id) {
  const { error } = await supabase.from("profiles").update({ status: "suspended" }).eq("id", id);
  if (error) throw error;
}

export const deleteUser = suspendUser;
