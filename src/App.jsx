import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Progress from "./pages/Progress";
import Leaderboard from "./pages/Leaderboard";
import Lessons from "./pages/Lessons";
import Settings from "./pages/Settings";
import ContentManagement from "./pages/ContentManagement";
import TrafficLaws from "./pages/TrafficLaws";
import TrafficSigns from "./pages/TrafficSigns";
import LicenseCodes from "./pages/LicenseCodes";
import WrittenExams from "./pages/WrittenExams";
import DrivingScenarios from "./pages/DrivingScenarios";
import Achievements from "./pages/Achievements";
import Announcements from "./pages/Announcements";

function App() {
  return (

    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
  path="/"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>

        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="users" element={<Users />} />

        <Route path="progress" element={<Progress />} />

        <Route path="leaderboard" element={<Leaderboard />} />

        <Route path="lessons" element={<Lessons />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="traffic-laws" element={<TrafficLaws />} />
        <Route path="traffic-signs" element={<TrafficSigns />} />
        <Route path="license-codes" element={<LicenseCodes />} />
        <Route path="written-exams" element={<WrittenExams />} />
        <Route path="driving-scenarios" element={<DrivingScenarios />} />
        <Route path="mastery-certification" element={<Achievements />} />
        <Route path="achievements" element={<Navigate to="/mastery-certification" replace />} />
        <Route path="announcements" element={<Announcements />} />

        <Route path="settings" element={<Settings />} />

      </Route>

    </Routes>

  );
}

export default App;
