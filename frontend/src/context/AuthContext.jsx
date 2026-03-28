/**
 * context/AuthContext.jsx — Global Authentication State
 *
 * Provides login/logout/user state to all components via React Context.
 * JWT is stored in localStorage and attached to every API request via axios interceptor.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True while verifying stored token

  // On app load, check if a valid token exists in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend and get fresh user data
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
