"use client";
import { createContext, useContext, useEffect, useState } from "react";

const KEY = "token";
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const getToken = () => (typeof window !== "undefined" ? localStorage.getItem(KEY) : null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sahifa yuklanganda localStorage'dagi token serverda tekshiriladi
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) localStorage.removeItem(KEY);
        if (res.ok) setUser((await res.json()).user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (token, user) => {
    localStorage.setItem(KEY, token);
    setUser(user);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
