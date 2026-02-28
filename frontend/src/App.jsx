import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SubjectsPage from "./pages/SubjectsPage.jsx";
import MaterialsPage from "./pages/MaterialsPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import RoleGuard from "./components/RoleGuard.jsx";
import AdminSubjectsPage from "./pages/AdminSubjectsPage.jsx";
import AdminMaterialsPage from "./pages/AdminMaterialsPage.jsx";
import AdminEventsPage from "./pages/AdminEventsPage.jsx";
import AdminComponentsPage from "./pages/AdminComponentsPage.jsx";
import ReminderDashboard from "./pages/ReminderDashboard.jsx";
import MaterialDetailPage from "./pages/MaterialDetailPage.jsx";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="materials/:id" element={<MaterialDetailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="reminders" element={<ReminderDashboard />} />
        <Route
          path="admin/subjects"
          element={
            <RoleGuard roles={["cr", "admin"]}>
              <AdminSubjectsPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/materials"
          element={
            <RoleGuard roles={["cr", "admin"]}>
              <AdminMaterialsPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/events"
          element={
            <RoleGuard roles={["cr", "admin"]}>
              <AdminEventsPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/components"
          element={
            <RoleGuard roles={["cr", "admin"]}>
              <AdminComponentsPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/reminders"
          element={
            <RoleGuard roles={["cr", "admin"]}>
              <ReminderDashboard />
            </RoleGuard>
          }
        />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
