import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaCheckDouble,
  FaChevronDown,
  FaChevronRight,
  FaMoon,
  FaSearch,
  FaSignInAlt,
  FaSun,
  FaTrash,
  FaTrophy,
  FaUserCircle,
  FaUserPlus,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { useTheme } from "../../context/ThemeContext";
import {
  ADMIN_NOTIFICATION_LIMIT,
  clearAdminNotifications,
  getAdminNotifications,
  isAdminNotificationDismissed,
  markAdminNotificationsRead,
  subscribeToAdminNotifications,
} from "../../services/notificationService";
import { globalSearch } from "../../services/searchService";

const EMPTY_RESULTS = { users: [], lessons: [] };

function formatNotificationTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleString();
}

function NotificationIcon({ type }) {
  const isRegistration = type === "account_created";
  const isAchievement = type === "achievement";
  const Icon = isAchievement ? FaTrophy : isRegistration ? FaUserPlus : FaSignInAlt;
  const colorClasses = isAchievement
    ? "bg-amber-100 text-amber-600"
    : isRegistration
      ? "admin-notification-icon-registration bg-emerald-100 text-emerald-600"
      : "admin-notification-icon-login bg-blue-100 text-blue-600";
  return (
    <span
      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorClasses}`}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}

function Navbar({ onMenu, sidebarHidden = false }) {
  const navigate = useNavigate();
  const { search, setSearch } = useSearch();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const adminId = user?.id;

  const [results, setResults] = useState(EMPTY_RESULTS);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    if (!adminId) {
      setNotifications([]);
      setNotificationsLoading(false);
      return;
    }

    try {
      setNotificationError("");
      setNotifications(await getAdminNotifications(adminId));
    } catch (error) {
      console.error("Unable to load administrator notifications:", error);
      setNotificationError(error.message || "Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    loadNotifications();
    if (!adminId) return undefined;

    return subscribeToAdminNotifications((notification) => {
      if (isAdminNotificationDismissed(notification.id, adminId)) return;
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, ADMIN_NOTIFICATION_LIMIT));
    });
  }, [adminId, loadNotifications]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setResults(EMPTY_RESULTS);
        return;
      }

      const data = await globalSearch(search);
      setResults(data);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((notification) => !notification.isRead)
      .map((notification) => notification.id);
    if (!adminId || unreadIds.length === 0) return;

    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    try {
      await markAdminNotificationsRead(unreadIds, adminId);
    } catch (error) {
      console.error("Unable to mark administrator notifications as read:", error);
      setNotificationError("Unable to save notification status.");
      await loadNotifications();
    }
  };

  const clearNotifications = () => {
    if (!adminId || notifications.length === 0) return;
    clearAdminNotifications(notifications.map((item) => item.id), adminId);
    setNotifications([]);
    setNotificationError("");
  };

  const openNotification = async (notification) => {
    setShowNotifications(false);
    if (!notification.isRead && adminId) {
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item));
      try {
        await markAdminNotificationsRead([notification.id], adminId);
      } catch (error) {
        console.error("Unable to mark administrator notification as read:", error);
      }
    }
    navigate("/users");
  };

  return (
    <header className="admin-navbar relative z-30 flex h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl md:px-7">
      <button
        title={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
        aria-label={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
        className="utility-button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600"
        onClick={onMenu}
      >
        {sidebarHidden ? <FaChevronRight /> : <FaBars />}
      </button>

      <div className="relative w-full max-w-md">
        <FaSearch className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search users or content..."
          className="admin-search w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />

        {showDropdown && search && (
          <div className="absolute left-0 z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border bg-white shadow-xl">
            {results.users.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-bold text-slate-400">USERS</div>
                {results.users.map((resultUser) => (
                  <button
                    key={resultUser.id}
                    onClick={() => {
                      navigate("/users");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-100"
                  >
                    <p className="font-medium">{resultUser.name}</p>
                    <p className="text-xs text-slate-500">{resultUser.email}</p>
                  </button>
                ))}
              </>
            )}

            {results.lessons.length > 0 && (
              <>
                <div className="border-t px-4 py-2 text-xs font-bold text-slate-400">LESSONS</div>
                {results.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      navigate("/lessons");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-100"
                  >
                    <p className="font-medium">{lesson.title}</p>
                  </button>
                ))}
              </>
            )}

            {results.users.length === 0 &&
              results.lessons.length === 0 &&
              !results.trafficLaws?.length &&
              !results.trafficSigns?.length &&
              !results.licenseCodes?.length &&
              !results.examQuestions?.length && (
                <div className="px-4 py-6 text-center text-slate-500">No results found</div>
              )}

            {[
              ["TRAFFIC LAWS", "trafficLaws", "/traffic-laws", "title"],
              ["TRAFFIC SIGNS", "trafficSigns", "/traffic-signs", "name"],
              ["LICENSE CODES", "licenseCodes", "/license-codes", "code"],
              ["EXAM QUESTIONS", "examQuestions", "/written-exams", "question"],
            ].map(([label, key, path, titleKey]) => results[key]?.length > 0 && (
              <div key={key}>
                <div className="border-t px-4 py-2 text-xs font-bold text-slate-400">{label}</div>
                {results[key].slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(path);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-100"
                  >
                    <p className="truncate font-medium">{item[titleKey]}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="utility-button flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100"
        >
          {isDark ? <FaSun /> : <FaMoon />}
        </button>

        <div className="relative">
          <button
            className="utility-button relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            onClick={() => {
              setShowNotifications((current) => !current);
              setShowProfile(false);
            }}
          >
            <FaBell className="text-lg text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="admin-notification-menu absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <strong>Account activity</strong>
                  <p className="text-xs text-slate-500">Registrations and learner logins</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-red-600 disabled:text-slate-400" disabled={notifications.length === 0} onClick={clearNotifications}><FaTrash /> Clear</button>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 disabled:text-slate-400" disabled={unreadCount === 0} onClick={markAllAsRead}><FaCheckDouble /> Mark all read</button>
                </div>
              </div>

              <div className="max-h-[28rem] overflow-y-auto">
                {notificationsLoading && (
                  <p className="px-4 py-8 text-center text-sm text-slate-500">Loading notifications...</p>
                )}
                {!notificationsLoading && notificationError && notifications.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-red-600">{notificationError}</p>
                    <button className="mt-2 text-sm font-semibold text-blue-600" onClick={loadNotifications}>Try again</button>
                  </div>
                )}
                {!notificationsLoading && !notificationError && notifications.length === 0 && (
                  <div className="px-4 py-10 text-center">
                    <FaBell className="mx-auto mb-3 text-2xl text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No account activity yet</p>
                    <p className="mt-1 text-xs text-slate-500">New registrations and logins will appear here.</p>
                  </div>
                )}
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => openNotification(notification)}
                    className={`flex w-full gap-3 border-b px-4 py-3 text-left hover:bg-slate-50 ${
                      notification.isRead ? "" : "admin-notification-unread bg-blue-50"
                    }`}
                  >
                    <NotificationIcon type={notification.event_type} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-800">{notification.title}</span>
                        {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-600">{notification.message}</span>
                      <span className="mt-1 block text-xs text-slate-500">{formatNotificationTime(notification.created_at)}</span>
                    </span>
                  </button>
                ))}
              </div>

              {notifications.length > 0 && (
                <button
                  className="w-full py-3 text-sm font-semibold text-blue-600 hover:bg-slate-50"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/users");
                  }}
                >
                  Open user management
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="admin-profile flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 hover:border-slate-200 hover:bg-slate-50"
            onClick={() => {
              setShowProfile((current) => !current);
              setShowNotifications(false);
            }}
          >
            <FaUserCircle className="text-4xl text-slate-700" />
            <div className="hidden text-left md:block">
              <p className="font-semibold">{user?.displayName || "Administrator"}</p>
              <p className="text-sm text-gray-500">{user?.profile?.role || "admin"}</p>
            </div>
            <FaChevronDown className="text-xs text-slate-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 z-50 mt-3 w-48 rounded-xl border bg-white py-2 shadow-xl">
              <button className="w-full px-4 py-2 text-left hover:bg-slate-50" onClick={() => navigate("/settings")}>Profile</button>
              <button className="w-full px-4 py-2 text-left hover:bg-slate-50" onClick={() => navigate("/settings")}>Settings</button>
              <button
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                onClick={async () => {
                  await signOut();
                  navigate("/login");
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
