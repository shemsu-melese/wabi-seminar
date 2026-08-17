import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../components/common/Navbar.jsx";

import DashboardPage from "../pages/DashboardPage.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import FeaturesPage from "../pages/FeaturesPage.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import MeetingPage from "../pages/MeetingPage.jsx";

function AppRouter() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/home"
          element={<HomePage />}
        />

        <Route
          path="/features"
          element={<FeaturesPage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/meeting/:code"
          element={<MeetingPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRouter;