/**
 * App.jsx — Root component with routing
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BotDetailPage from "./pages/BotDetailPage";
import CreateBotPage from "./pages/CreateBotPage";
import EditBotPage from "./pages/EditBotPage";
import ConversationsPage from "./pages/ConversationsPage";

// Layout
import Layout from "./components/Layout";

// ─── Protected Route Guard ────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── Public Route Guard (redirect if already logged in) ───────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

    {/* Protected routes wrapped in the dashboard layout */}
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="bots/new" element={<CreateBotPage />} />
      <Route path="bots/:id" element={<BotDetailPage />} />
      <Route path="bots/:id/edit" element={<EditBotPage />} />
      <Route path="bots/:id/conversations" element={<ConversationsPage />} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
