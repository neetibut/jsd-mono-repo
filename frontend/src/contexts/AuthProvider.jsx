import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const apiBase = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        const res = await fetch(`${apiBase}/users/auth`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const response = await res.json();
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [apiBase]);

  const login = async ({ email, password }) => {
    setAuthError(null);
    try {
      const res = await fetch(`${apiBase}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || "Login failed");
      }
      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.message || "Login failed");
      setUser(null);
      return false;
    }
  };

  const register = async ({ username, email, password }) => {
    setAuthError(null);
    try {
      const res = await fetch(`${apiBase}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || "Registration failed");
      }
      return await login({ email, password });
    } catch (err) {
      setAuthError(err.message || "Registration failed");
      return false;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await fetch(`${apiBase}/users/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authLoading, authError, apiBase, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
