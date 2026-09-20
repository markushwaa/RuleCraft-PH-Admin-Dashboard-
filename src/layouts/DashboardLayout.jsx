import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import { useTheme } from "../context/ThemeContext";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(
    () => localStorage.getItem("rulecraft-admin-sidebar-hidden") === "true"
  );
  const { isDark } = useTheme();
  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarHidden(current => {
        localStorage.setItem("rulecraft-admin-sidebar-hidden", String(!current));
        return !current;
      });
    } else {
      setSidebarOpen(true);
    }
  };
  return (
    <div className={`admin-workspace h-screen flex overflow-hidden bg-slate-100 ${isDark ? "admin-dark" : "admin-light"}`}>

      <Sidebar open={sidebarOpen} hidden={sidebarHidden} onClose={() => setSidebarOpen(false)} />

      <div className="admin-shell flex-1 flex flex-col min-w-0">

        <Navbar onMenu={toggleSidebar} sidebarHidden={sidebarHidden} />

        <main className="admin-main flex-1 overflow-y-auto bg-slate-100 p-4 md:p-6 xl:p-8">
          <div className="mx-auto w-full max-w-[1680px]"><Outlet /></div>

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
