import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import api from "../lib/axios";
import type { MeResponse, SubscriptionInfo, UserInfo } from "../types/auth";

export type SubscriptionTier = "free" | "pro";

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  subscription: SubscriptionTier;
  subs?: SubscriptionInfo;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateSubscription: (tier: SubscriptionTier) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = window.localStorage.getItem("user");
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    api
      .get<MeResponse>("/me")
      .then((response) => {
        const data = response.data;
        const planCode = (data.subs.plan_code ?? "").toLowerCase();
        const tier: SubscriptionTier = planCode === "pro" ? "pro" : "free";
        const freshUser: AuthUser = {
          id: String(data.user.id ?? ""),
          name: data.user.name ?? "",
          email: data.user.email ?? "",
          subscription: tier,
          subs: data.subs,
        };
        setUser(freshUser);
        window.localStorage.setItem("user", JSON.stringify(freshUser));
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          setUser(null);
          setToken(null);
          window.localStorage.removeItem(TOKEN_KEY);
          window.localStorage.removeItem("user");
        }
        
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const updateSubscription = (tier: SubscriptionTier) => {
    if (user) {
      const updatedUser: AuthUser = { ...user, subscription: tier };
      setUser(updatedUser);
      window.localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser: AuthUser = { ...user, ...updates };
      setUser(updatedUser);
      window.localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextValue = useMemo(() => {
    return {
      user,
      token,
      isAuthenticated: !!token && !isLoading,
      isLoading,
      login: (u, t) => {
        setUser(u);
        setToken(t);
        window.localStorage.setItem(TOKEN_KEY, t);
        window.localStorage.setItem("user", JSON.stringify(u));
      },
      logout: () => {
        setUser(null);
        setToken(null);
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem("user");
      },
      updateSubscription,
      updateUser,
    };
  }, [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return ctx;
}

