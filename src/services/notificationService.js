import { supabase } from "../supabase/config";

export const ADMIN_NOTIFICATION_LIMIT = 12;

const dismissedKey = (adminId) => `rulecraft.admin.notifications.dismissed.${adminId}`;

function dismissedIds(adminId) {
  if (!adminId || typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(window.localStorage.getItem(dismissedKey(adminId)) || "[]")); }
  catch { return new Set(); }
}

export function isAdminNotificationDismissed(notificationId, adminId) {
  return dismissedIds(adminId).has(notificationId);
}

export function clearAdminNotifications(notificationIds, adminId) {
  if (!adminId || typeof window === "undefined") return;
  const ids = dismissedIds(adminId);
  notificationIds.filter(Boolean).forEach((id) => ids.add(id));
  window.localStorage.setItem(dismissedKey(adminId), JSON.stringify([...ids].slice(-500)));
}

function notificationSetupError(error) {
  const details = `${error?.code || ""} ${error?.message || ""} ${error?.details || ""}`;
  if (
    error?.code === "PGRST205" ||
    details.includes("admin_notifications") ||
    details.includes("admin_notification_reads")
  ) {
    return new Error(
      "Admin notifications are not configured yet. Ask the system administrator to complete the notification setup.",
    );
  }
  return error;
}

export async function getAdminNotifications(adminId) {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select(`
      id,
      event_type,
      actor_user_id,
      title,
      message,
      metadata,
      created_at,
      admin_notification_reads!left(admin_id, read_at)
    `)
    .order("created_at", { ascending: false })
    .limit(ADMIN_NOTIFICATION_LIMIT);

  if (error) throw notificationSetupError(error);
  return (data || []).filter((notification) =>
    !isAdminNotificationDismissed(notification.id, adminId)).map((notification) => ({
    ...notification,
    isRead: (notification.admin_notification_reads || []).some(
      (receipt) => receipt.admin_id === adminId,
    ),
  }));
}

export async function markAdminNotificationsRead(notificationIds, adminId) {
  const uniqueIds = [...new Set(notificationIds.filter(Boolean))];
  if (!adminId || uniqueIds.length === 0) return;

  const readAt = new Date().toISOString();
  const receipts = uniqueIds.map((notificationId) => ({
    notification_id: notificationId,
    admin_id: adminId,
    read_at: readAt,
  }));
  const { error } = await supabase
    .from("admin_notification_reads")
    .upsert(receipts, { onConflict: "notification_id,admin_id" });

  if (error) throw notificationSetupError(error);
}

export function subscribeToAdminNotifications(onNotification) {
  const channel = supabase
    .channel("rulecraft-admin-account-notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "admin_notifications",
      },
      ({ new: notification }) => onNotification({ ...notification, isRead: false }),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
