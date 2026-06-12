import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient, setAccessToken, clearAccessToken, getAccessToken } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = not authed; undefined = checking
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const { data } = await apiClient.get("/auth/me");
      setUser(data);
      return data;
    } catch {
      clearAccessToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email, password) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    if (data?.access_token) {
      setAccessToken(data.access_token);
      const refreshedUser = await refresh();
      return refreshedUser || data;
    }
    return data;
  };

  const register = async ({ email, password, name, mobile }) => {
    const { data } = await apiClient.post("/auth/register", { email, password, name, mobile });
    if (data?.access_token) {
      setAccessToken(data.access_token);
      const refreshedUser = await refresh();
      return refreshedUser || data;
    }
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    }
    clearAccessToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
