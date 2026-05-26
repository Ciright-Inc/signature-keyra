"use client";

import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type KeyraSessionUser = {
  phoneE164: string;
  displayName?: string;
};

const AUTH_CHANNEL = "keyra-auth";
const SESSION_TIMEOUT_MS = 4000;

type AuthSessionPayload = {
  authenticated: boolean;
  user?: { phone?: string; username?: string | null; fullName?: string | null } | null;
};

function authSessionDisplayName(
  user: NonNullable<AuthSessionPayload["user"]>,
): string | undefined {
  const username = typeof user.username === "string" ? user.username.trim() : "";
  if (username) return username;
  const fullName = typeof user.fullName === "string" ? user.fullName.trim() : "";
  if (fullName) return fullName;
  return undefined;
}

async function fetchSessionUser(signal?: AbortSignal): Promise<KeyraSessionUser | null> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal,
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as AuthSessionPayload;
    if (!payload.authenticated || !payload.user?.phone) return null;
    const phone = payload.user.phone.startsWith("+") ? payload.user.phone : `+${payload.user.phone}`;
    return { phoneE164: phone, displayName: authSessionDisplayName(payload.user) };
  } catch {
    return null;
  }
}

type KeyraSessionContextValue = {
  user: KeyraSessionUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  headerLabel: string | null;
};

const KeyraSessionContext = createContext<KeyraSessionContextValue | null>(null);

export function KeyraSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KeyraSessionUser | null>(null);
  const [initialized, setInitialized] = useState(false);
  const fetchingRef = useRef(false);

  const fetchSession = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);
    try {
      const next = await fetchSessionUser(controller.signal);
      setUser(next);
    } catch {
      setUser(null);
    } finally {
      clearTimeout(timeout);
      fetchingRef.current = false;
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    try {
      new BroadcastChannel(AUTH_CHANNEL).postMessage({ type: "logout" });
    } catch {
      // ignore
    }
  }, []);

  const headerLabel = useMemo(() => {
    if (!user) return null;
    return user.displayName?.trim() || formatPhoneDisplay(user.phoneE164);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      initialized,
      refresh: fetchSession,
      logout,
      headerLabel,
    }),
    [user, initialized, fetchSession, logout, headerLabel],
  );

  return <KeyraSessionContext.Provider value={value}>{children}</KeyraSessionContext.Provider>;
}

export function useKeyraSession() {
  const ctx = useContext(KeyraSessionContext);
  if (!ctx) throw new Error("useKeyraSession must be used within KeyraSessionProvider");
  return ctx;
}
