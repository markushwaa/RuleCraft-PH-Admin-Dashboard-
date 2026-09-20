import { supabase } from "../supabase/config";
import { getLessons } from "./lessonService";
import { compareLeaderboardUsers, getUsers, isLearner } from "./userService";

const CONTENT_TABLES = [
  "traffic_laws",
  "traffic_signs",
  "license_codes",
  "written_exam_questions",
  "driving_scenarios",
  "achievements",
  "learning_modules",
];

const MODULES = [
  ["Traffic Laws", "trafficLaws"],
  ["Traffic Signs", "trafficSigns"],
  ["License Codes", "licenseCodes"],
  ["Written Exam", "writtenExam"],
  ["Driving Simulation", "driving"],
];

function relativeTime(value) {
  const milliseconds = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(milliseconds / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function userGrowth(users) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return {
      month: date.toLocaleDateString(undefined, { month: "short" }),
      users: users.filter((user) => {
        const created = new Date(user.createdAt);
        return created >= date && created < next;
      }).length,
    };
  });
}

function examTypeLabel(value) {
  const normalized = String(value || "").replaceAll(/[^a-z]/gi, "").toLowerCase();
  return normalized === "professional" ? "Professional" : "Non-Professional";
}

export async function getDashboardAnalytics() {
  const [allUsers, lessons, ...contentCounts] = await Promise.all([
    getUsers(),
    getLessons(),
    ...CONTENT_TABLES.map((table) =>
      supabase.from(table).select("*", { count: "exact", head: true }).eq("is_published", true),
    ),
  ]);
  contentCounts.forEach((result) => {
    if (result.error) throw result.error;
  });
  const users = allUsers.filter(isLearner);

  const allAttempts = users.flatMap((user) => user.examAttempts.map((attempt) => ({ ...attempt, userName: user.name })));
  const allSessions = users.flatMap((user) => user.drivingSessions.map((session) => ({ ...session, userName: user.name })));
  const allQuests = users.flatMap((user) => user.questProgress.map((quest) => ({ ...quest, userName: user.name })));
  const allCertificates = users.flatMap((user) => user.masteryCertificates.map((certificate) => ({ ...certificate, userName: user.name })));
  const allInteractions = users.flatMap((user) => user.contentInteractions.map((interaction) => ({ ...interaction, userName: user.name })));
  const allAiMessages = users.flatMap((user) => user.aiMessages.map((message) => ({ ...message, userName: user.name })));
  const recentActivity = [
    ...allAttempts.map((attempt) => ({
      user: attempt.userName,
      kind: "exam",
      action: `Attempted a ${examTypeLabel(attempt.exam_type)} written exam`,
      resultStatus: attempt.passed ? "PASSED" : "FAILED",
      passed: Boolean(attempt.passed),
      score: Number(attempt.score || 0),
      totalQuestions: Number(attempt.total_questions || 0),
      percentage: Number(attempt.percentage || 0),
      occurredAt: attempt.completed_at,
    })),
    ...allSessions.map((session) => ({
      user: session.userName,
      kind: "driving",
      action: `${session.attempt_status === "in_progress" ? "Started" : "Completed"} ${session.scenario_name || "a driving scenario"}`,
      resultStatus: session.attempt_status === "in_progress" ? "IN PROGRESS" : session.completed ? "COMPLETED" : "ENDED EARLY",
      score: Number(session.final_score || 0),
      percentage: Number(session.final_score || 0),
      occurredAt: session.attempt_status === "in_progress" ? session.started_at : (session.updated_at || session.completed_at),
    })),
    ...allQuests.filter((quest) => quest.completed).map((quest) => ({
      user: quest.userName,
      kind: "quest",
      action: `Completed quest ${quest.quest_id}`,
      resultStatus: "COMPLETED",
      occurredAt: quest.completed_at || quest.updated_at,
    })),
    ...allCertificates.map((certificate) => ({
      user: certificate.userName,
      kind: "certificate",
      action: `Earned ${String(certificate.certificate_type || "mastery").replaceAll("_", " ")} certificate`,
      resultStatus: "ISSUED",
      occurredAt: certificate.issued_at,
    })),
    ...allAiMessages.filter((message) => message.message_role === "assistant").map((message) => ({
      user: message.userName,
      kind: "ai",
      action: "Received AI-assisted learning feedback",
      occurredAt: message.created_at,
    })),
    ...allInteractions.map((interaction) => ({
      user: interaction.userName,
      kind: "content",
      action: `Studied ${String(interaction.content_type || "learning content").replaceAll("_", " ")}`,
      occurredAt: interaction.occurred_at,
    })),
  ]
    .filter((activity) => activity.occurredAt && !Number.isNaN(new Date(activity.occurredAt).getTime()))
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, 6)
    .map((activity) => ({ ...activity, time: relativeTime(activity.occurredAt) }));

  const moduleEngagement = MODULES.map(([name, key]) => ({
    name,
    value: users.length
      ? Math.round(users.reduce((total, user) => total + Number(user.moduleProgress[key] || 0), 0) / users.length)
      : 0,
  }));

  const examPerformance = ["Non-Professional", "Professional"].map((name) => {
    const attempts = allAttempts.filter((attempt) => examTypeLabel(attempt.exam_type) === name);
    return {
      name,
      attempts: attempts.length,
      passRate: attempts.length ? Math.round(attempts.filter((attempt) => attempt.passed).length / attempts.length * 100) : 0,
    };
  });

  return {
    users,
    lessons,
    topPlayers: [...users].filter(isLearner).sort(compareLeaderboardUsers).slice(0, 5),
    recentActivity,
    moduleEngagement,
    examPerformance,
    scopeMetrics: {
      contentInteractions: allInteractions.length,
      aiFeedback: allAiMessages.filter((message) => message.message_role === "assistant").length,
      completedQuests: allQuests.filter((quest) => quest.completed).length,
      masteryCertificates: allCertificates.length,
    },
    growth: userGrowth(users),
    stats: {
      totalUsers: users.length,
      activePlayers: users.filter((user) => user.status === "active").length,
      examAttempts: allAttempts.length,
      examPassRate: allAttempts.length ? Math.round(allAttempts.filter((attempt) => attempt.passed).length / allAttempts.length * 100) : 0,
      drivingSessions: allSessions.length,
      completion: users.length ? Math.round(users.reduce((total, user) => total + Number(user.progress || 0), 0) / users.length) : 0,
      publishedContent: contentCounts.reduce((total, result) => total + Number(result.count || 0), 0) + lessons.filter((lesson) => lesson.status === "Published").length,
      activeStreaks: users.filter((user) => Number(user.currentStreak || 0) > 0).length,
    },
  };
}
