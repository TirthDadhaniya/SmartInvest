import { useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = userData => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore logout request failures and clear local session state.
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
