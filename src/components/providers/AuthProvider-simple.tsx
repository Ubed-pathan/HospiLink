"use client";

import React from "react";
import { useSetRecoilState } from "recoil";
import { authState as recoilAuthState } from "@/lib/atoms";
import { useRouter, usePathname } from "next/navigation";
import { authAPI } from "@/lib/api-services";

export default function RecoilAuthProvider({ children }: { children: React.ReactNode }) {
  const setRecoilAuth = useSetRecoilState(recoilAuthState);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const hasCheckedAuth = React.useRef(false);
  const pathname = usePathname();

  React.useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    let didCancel = false;

    (async () => {
      try {
        setRecoilAuth(prev => ({ ...prev, isLoading: true }));
        const response = await authAPI.loadOnRefresh();
        // If we get here, status is 200 (handled in api-services)
        if (!didCancel && response && response.id && response.username) {
          const user = {
            id: response.id,
            email: response.email,
            name: response.fullName,
            username: response.username,
            role: 'patient' as const,
          };
          setRecoilAuth({
            isAuthenticated: true,
            user,
            token: null,
            isLoading: false,
          });
          if (pathname !== '/portal') {
            router.push('/portal');
          }
        } else if (!didCancel) {
          setRecoilAuth({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
          if (pathname !== '/auth/signin') {
            router.push('/auth/signin');
          }
        }
      } catch {
        if (!didCancel) {
          setRecoilAuth({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
          if (pathname !== '/auth/signin') {
            router.push('/auth/signin');
          }
        }
      } finally {
        if (!didCancel) setIsInitialized(true);
      }
    })();

    return () => {
      didCancel = true;
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HospiLink...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
