import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import { authClient } from "../lib/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const checkSession = async () => {
      try {
        const { data } = await authClient.get("/me");
        if (!ignore) {
          setUser(data.user);
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await authClient.post("/login", { email, password });
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await authClient.post("/register", {
      username,
      email,
      password,
    });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authClient.post("/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
