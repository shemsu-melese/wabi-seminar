import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import ProtectedLayout from '../components/layout/ProtectedLayout.jsx';

// Lazy load pages
const LandingPage = React.lazy(() => import('../pages/landing/LandingPage.jsx'));
const AboutPage = React.lazy(() => import('../pages/about/AboutPage.jsx'));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage.jsx'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage.jsx'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword.jsx'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword.jsx'));
const ResetPasswordSuccess = React.lazy(() => import('../pages/auth/ResetPasswordSuccess.jsx'));
const HelpPage = React.lazy(() => import('../pages/help/HelpPage.jsx'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage.jsx'));
const MeetingsPage = React.lazy(() => import('../pages/meetings/MeetingsPage.jsx'));
const CreateMeetingPage = React.lazy(() => import('../pages/meetings/CreateMeetingPage.jsx'));
const EditMeetingPage = React.lazy(() => import('../pages/meetings/EditMeetingPage.jsx'));
const MeetingRoom = React.lazy(() => import('../pages/meetings/MeetingRoom.jsx')); // Join route
const ProfilePage = React.lazy(() => import('../pages/profile/ProfilePage.jsx'));
const AttendancePage = React.lazy(() => import('../pages/attendance/AttendancePage.jsx'));
const NotFoundPage = React.lazy(() => import('../pages/errors/NotFoundPage.jsx'));

function AppRoutes() {
    return (
        <React.Suspense fallback={<div className="loading-screen">Loading...</div>}>
            <Routes>
                {/* ============================================
                    PUBLIC ROUTES (No authentication required)
                ============================================ */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/reset-password/success" element={<ResetPasswordSuccess />} />
                </Route>

                {/* ============================================
                    PROTECTED ROUTES (Authentication required)
                ============================================ */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<ProtectedLayout />}>
                        {/* Dashboard */}
                        <Route path="/dashboard" element={<DashboardPage />} />

                        {/* Meetings – CRUD + Join */}
                        <Route path="/meetings" element={<MeetingsPage />} />
                        <Route path="/meetings/create" element={<CreateMeetingPage />} />
                        <Route path="/meetings/edit/:meetingId" element={<EditMeetingPage />} />

                        {/* Join Meeting – by meeting code */}
                        <Route path="/meeting/:code" element={<MeetingRoom />} />

                        {/* Profile & Attendance */}
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/attendance" element={<AttendancePage />} />
                        <Route path="/attendance/:meetingId" element={<AttendancePage />} />
                    </Route>
                </Route>

                {/* ============================================
                    404 – Not Found
                ============================================ */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </React.Suspense>
    );
}

export default AppRoutes;