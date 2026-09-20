import logo from "../../assets/logo/rulecraft-logo.png";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaTachometerAlt,
  FaUsers,
  FaChartLine,
  FaTrophy,
  FaBook,
  FaCog,
  FaSignOutAlt,
  FaBalanceScale, FaTrafficLight, FaIdCard, FaClipboardCheck,
  FaCar, FaCertificate, FaBullhorn, FaTimes,
} from "react-icons/fa";

const menu = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: FaTachometerAlt,
      },
      {
        name: "User Management",
        path: "/users",
        icon: FaUsers,
      },
      {
        name: "User Progress",
        path: "/progress",
        icon: FaChartLine,
      },
      {
        name: "Leaderboard",
        path: "/leaderboard",
        icon: FaTrophy,
      },
      {
        name: "Learning Content", path: "/content", icon: FaBook,
      },
    ],
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      { name: "Traffic Laws", path: "/traffic-laws", icon: FaBalanceScale },
      { name: "Traffic Signs", path: "/traffic-signs", icon: FaTrafficLight },
      { name: "License Codes", path: "/license-codes", icon: FaIdCard },
      { name: "Written Exams", path: "/written-exams", icon: FaClipboardCheck },
      { name: "Driving Scenarios", path: "/driving-scenarios", icon: FaCar },
      { name: "Readiness & Achievements", path: "/mastery-certification", icon: FaCertificate },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Announcements", path: "/announcements", icon: FaBullhorn },
      {
        name: "Settings",
        path: "/settings",
        icon: FaCog,
      },
    ],
  },
];

function Sidebar({ open = false, hidden = false, onClose }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {

  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) return;

  try {

    await signOut();

    navigate("/login");

  } catch (error) {

    console.error("Logout failed:", error);

    alert("Unable to logout.");

  }

};
  return (
    <>
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={onClose} />}
    <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white border-r border-slate-800 flex flex-col transition-transform lg:static lg:translate-x-0 ${hidden ? "lg:hidden" : "lg:flex"} ${open ? "translate-x-0" : "-translate-x-full"}`}>

      {/* Logo */}

      <div className="sidebar-brand px-5 py-4 border-b border-slate-800 flex-shrink-0">

        <div className="flex items-center gap-3">

          <img
            src={logo}
            alt="RuleCraft PH"
            className="w-11 h-11 object-contain drop-shadow-[0_6px_16px_rgba(37,99,235,.35)]"
          />

          <div>

            <h1 className="font-bold text-lg">
              RuleCraft PH
            </h1>

            <p className="text-xs text-slate-400">
              Administrator Portal
            </p>

          </div>
          <button className="ml-auto text-slate-400 lg:hidden" onClick={onClose}><FaTimes /></button>

        </div>

      </div>

      {/* Navigation */}

      <nav className="sidebar-navigation flex-1 px-3 py-3 overflow-hidden">

        {menu.map((section) => (

          <div
            key={section.title}
            className="sidebar-section mb-3"
          >

            <p className="sidebar-section-title px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">
              {section.title}
            </p>

            <div className="space-y-1">

              {section.items.map((item) => (

                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                      isActive
                        ? "active bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`
                  }
                >

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5"><item.icon className="text-sm" /></span>

                  <span>{item.name}</span>

                </NavLink>

              ))}

            </div>

          </div>

        ))}

      </nav>

      {/* Footer */}

      <div className="sidebar-footer border-t border-slate-800 p-3 flex-shrink-0"><div className="flex items-center gap-3 rounded-xl bg-white/[.04] p-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold">{(user?.displayName || "A").charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{user?.displayName || "Administrator"}</h3><p className="truncate text-[11px] capitalize text-slate-400">{user?.profile?.role || "Administrator"}</p></div><button title="Log out" aria-label="Log out" onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/15 hover:text-red-400"><FaSignOutAlt /></button></div></div>

    </aside>
    </>
  );
}

export default Sidebar;
