import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import DashboardPage from "../pages/DashboardPage";
import MeetingPage from "../pages/MeetingPage";
import MeetingHistoryPage from "../pages/MeetingHistoryPage";
import AttendancePage from "../pages/AttendancePage";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Dashboard Pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meetings" element={<MeetingPage />} />
          <Route
            path="/history"
            element={<MeetingHistoryPage />}
          />
          <Route
            path="/attendance"
            element={<AttendancePage />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;