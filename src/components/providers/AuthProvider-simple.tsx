"use client";

import React from "react";
import { useSetRecoilState } from "recoil";
import { authState as recoilAuthState } from "@/lib/atoms";
import { authAPI } from "@/lib/api-services";

export default function RecoilAuthProvider({ children }: { children: React.ReactNode }) {
  const setRecoilAuth = useSetRecoilState(recoilAuthState);
  const MAX_WAIT_MS = Number(process.env.NEXT_PUBLIC_AUTH_MAX_WAIT_MS || 120000); // default 2 minutes
  const INITIAL_DELAY_MS = 1000;
  const MAX_DELAY_MS = 5000;

  React.useEffect(() => {
    let didCancel = false;

    const maxWait = MAX_WAIT_MS;
    const initialDelay = INITIAL_DELAY_MS;
    const maxDelay = MAX_DELAY_MS;
    (async () => {
      setRecoilAuth(prev => ({ ...prev, isLoading: true }));
      const start = Date.now();
      let delay = initialDelay;
      while (!didCancel) {
        try {
          const response = await authAPI.loadOnRefresh();
          if (response && response.id && response.username) {
            if (didCancel) break;
            // Normalize roles coming as ["ADMIN","USER"] to lowercase app roles
            type RefreshPayload = { id: string; username: string; email?: string; fullName?: string; role?: string; roles?: string[] };
            const resp = response as unknown as RefreshPayload;
            const backendRoles: string[] = Array.isArray(resp.roles) ? resp.roles! : [];
            const normRoles = backendRoles
              .map(r => String(r).toLowerCase())
              .map(r => (r === 'user' ? 'patient' : r))
              .filter(r => r === 'patient' || r === 'doctor' || r === 'admin') as Array<'patient' | 'doctor' | 'admin'>;
            const primary: 'patient' | 'doctor' | 'admin' = (normRoles.includes('admin')
              ? 'admin'
              : normRoles.includes('doctor')
              ? 'doctor'
              : (response.role as 'patient' | 'doctor' | 'admin') || 'patient');

            const user = {
              id: response.id,
              email: response.email,
              name: response.fullName,
              username: response.username,
              role: primary,
              roles: normRoles.length ? normRoles : undefined,
            };
            setRecoilAuth({
              isAuthenticated: true,
              user,
              token: null,
              isLoading: false,
            });
            if (typeof window !== 'undefined') {
              try {
                window.__HOSPILINK_AUTH__ = { isAuthenticated: true, user };
                window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: true, user } }));
              } catch {}
            }
            break;
          }
          // If no user fields despite 200, treat as unauth
          setRecoilAuth({ isAuthenticated: false, user: null, token: null, isLoading: false });
          if (typeof window !== 'undefined') {
            try {
              window.__HOSPILINK_AUTH__ = { isAuthenticated: false, user: null };
              window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: false, user: null } }));
            } catch {}
          }
          break;
        } catch (err: unknown) {
          // If explicit 401 from backend, stop waiting and mark unauthenticated immediately
          const e = err as { status?: number; response?: { status?: number } };
          const status = e?.status ?? e?.response?.status;
          if (status === 401) {
            if (didCancel) break;
      setRecoilAuth({ isAuthenticated: false, user: null, token: null, isLoading: false });
            if (typeof window !== 'undefined') {
              try {
        window.__HOSPILINK_AUTH__ = { isAuthenticated: false, user: null };
        window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: false, user: null } }));
              } catch {}
            }
            break;
          }
          // Retry on network/timeout/server errors until MAX_WAIT_MS
          const elapsed = Date.now() - start;
          if (elapsed >= maxWait) {
            if (didCancel) break;
      setRecoilAuth({ isAuthenticated: false, user: null, token: null, isLoading: false });
            if (typeof window !== 'undefined') {
              try {
        window.__HOSPILINK_AUTH__ = { isAuthenticated: false, user: null };
        window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: false, user: null } }));
              } catch {}
            }
            break;
          }
          // Backoff delay
          await new Promise(res => setTimeout(res, delay));
          delay = Math.min(maxDelay, Math.floor(delay * 1.5));
          continue;
        }
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [setRecoilAuth, MAX_WAIT_MS, INITIAL_DELAY_MS, MAX_DELAY_MS]);

  return <>{children}</>;
}
