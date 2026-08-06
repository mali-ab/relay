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
  is_email_verified: boolean;
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
const USER_KEY = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, _setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const setUser = (newUser: AuthUser | null) => {
    _setUser(newUser);
    if (newUser) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    }else{
      window.localStorage.removeItem(USER_KEY);
    }
  };

  const [token, _setToken] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });
  
  const setToken = (newToken: string | null) => {
    _setToken(newToken);
    if (newToken) {
      window.localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    if (!user || user?.is_email_verified) {
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
          is_email_verified: data.user ? true : false,
          subscription: tier,
          subs: data.subs,
        };
        setUser(freshUser);
      })
      .catch((error) => {
        if (
          error?.response?.status === 401
        ) {
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const updateSubscription = (tier: SubscriptionTier) => {
    if (user) {
      const updatedUser: AuthUser = { ...user, subscription: tier };
      setUser(updatedUser);
      window.localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser: AuthUser = { ...user, ...updates };
      setUser(updatedUser);
      window.localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
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
      },
      logout: () => {
        setUser(null);
        setToken(null);
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
