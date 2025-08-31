"use client";

import React from "react";
import { useRouter } from "next/navigation";

type RequireRoleProps = {
  role: "admin" | "doctor";
  children: React.ReactNode;
  fallbackHref?: string; // where to redirect if unauthorized
};

export default function RequireRole({ role, children, fallbackHref }: RequireRoleProps) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    const evaluate = () => {
      const auth = window.__HOSPILINK_AUTH__;
      const stateKnown = typeof auth?.isAuthenticated === 'boolean';
      if (!stateKnown) {
        // not ready yet; wait for provider event
        setReady(false);
        return;
      }
      const currentRole = auth?.user?.role;
      const roles = auth?.user?.roles || [];
      const isAuthed = !!auth?.isAuthenticated;
      const ok = isAuthed && (currentRole === role || roles.includes(role));
      setAuthorized(ok);
      setReady(true);
      if (!ok && (fallbackHref || role === "admin")) {
        router.replace(fallbackHref || "/");
      }
    };

    // Try immediately
    evaluate();
    // Also wait for provider event once
  const onReady = () => evaluate();
    window.addEventListener("hospilink-auth-ready", onReady, { once: true });
    return () => window.removeEventListener("hospilink-auth-ready", onReady);
  }, [role, router, fallbackHref]);

  if (!ready) return null;
  if (!authorized) return null;
  return <>{children}</>;
}
