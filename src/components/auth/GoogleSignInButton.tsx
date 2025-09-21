"use client";
import React, { useEffect, useRef, useState } from 'react';
import { authAPI } from '@/lib/api-services';
import { useRouter } from 'next/navigation';

interface GoogleSignInButtonProps {
  size?: 'large' | 'medium' | 'small';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  labelFallback?: string; // fallback label if GIS script fails
  className?: string;
  onError?: (message: string) => void;
  variant?: 'google' | 'custom'; // custom = styled like signup page
}

interface GoogleIdCredentialResponse { credential: string; select_by?: string }
type GoogleAccounts = { id: { initialize: (cfg: { client_id?: string; callback: (resp: GoogleIdCredentialResponse) => void; ux_mode?: string; auto_select?: boolean }) => void; renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void; prompt?: ()=>void } };
declare global { interface Window { google?: { accounts: GoogleAccounts } } }

const scriptId = 'google-identity-services';

export default function GoogleSignInButton({
  size = 'large',
  theme = 'outline',
  text = 'continue_with',
  shape = 'rectangular',
  width = 320,
  labelFallback = 'Continue with Google',
  className = '',
  onError,
  variant = 'google',
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const divRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Load script once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!clientId) {
      setError('Google Client ID not configured');
      onError?.('Google Client ID not configured');
      return; // don't even load script if no client id
    }
    if (document.getElementById(scriptId)) { setReady(true); return; }
    const s = document.createElement('script');
    s.id = scriptId;
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    s.onerror = () => {
      const msg = 'Failed to load Google script';
      setError(msg);
      onError?.(msg);
    };
    document.head.appendChild(s);
  }, [onError, clientId]);

  // Initialize button
  // Shared callback for both variants
  const initializeGoogle = () => {
      if (!window.google) return;
    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: GoogleIdCredentialResponse) => {
          if (!response?.credential) return;
          setLoading(true);
          setError(null);
          try {
            type OnboardingResp = { onboardingRequired: true; email: string; name?: string };
            type UserDtoResp = { onboardingRequired?: false; username?: string; id?: string; email?: string; roles?: unknown } & Record<string, unknown>;
            const raw = await authAPI.googleLogin(response.credential) as OnboardingResp | UserDtoResp;
            if ('onboardingRequired' in raw && raw.onboardingRequired) {
              const params = new URLSearchParams({ email: raw.email, name: raw.name || '' });
              router.replace('/auth/google-onboarding?' + params.toString());
              return;
            }
            try {
              const authPayload = { isAuthenticated: true, user: raw } as Record<string, unknown>;
              (window as unknown as { __HOSPILINK_AUTH__?: Record<string, unknown> }).__HOSPILINK_AUTH__ = authPayload;
              window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: authPayload }));
            } catch {}
            router.replace('/');
          } catch (e) {
            const err = e as { response?: { data?: unknown }; message?: string };
            const msg = (err.response?.data as string) || err.message || 'Google sign-in failed';
            setError(msg);
            onError?.(msg);
          } finally {
            setLoading(false);
          }
        },
        ux_mode: 'popup',
        auto_select: false,
      });

      if (variant === 'google' && divRef.current) {
        window.google.accounts.id.renderButton(divRef.current, { theme, size, text, shape, width });
      }
    } catch {
      const msg = 'Google init error';
      setError(msg);
      onError?.(msg);
    }
  };

  useEffect(() => {
    if (!ready) return;
    if (!clientId) return; // already flagged
    initializeGoogle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, variant]);

  const handleCustomClick = () => {
    if (!window.google || !clientId) return;
    // Trigger Google popup (callback handles credential)
    try {
      window.google.accounts.id.prompt?.();
    } catch {
      const msg = 'Google prompt failed';
      setError(msg);
      onError?.(msg);
    }
  };

  if (variant === 'custom') {
    return (
      <div className={className + ' space-y-2'}>
        <button
          type="button"
          onClick={handleCustomClick}
          disabled={!ready || loading || !clientId}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        {error && <div className="text-xs text-red-600">{error}</div>}
        {!error && !clientId && (
          <div className="text-xs text-red-600">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</div>
        )}
        {!ready && !error && (
          <button
            type="button"
            disabled
            className="w-full bg-white border border-gray-300 rounded-md py-2 text-sm text-gray-600 flex items-center justify-center"
          >{labelFallback}</button>
        )}
      </div>
    );
  }

  return (
    <div className={className + ' space-y-2'}>
      <div ref={divRef} className={!ready ? 'opacity-50 pointer-events-none' : ''}></div>
      {loading && <div className="text-xs text-gray-500">Signing in…</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {!error && !clientId && <div className="text-xs text-red-600">Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID</div>}
      {!ready && !error && (
        <button
          type="button"
          disabled
          className="w-full bg-white border border-gray-300 rounded-md py-2 text-sm text-gray-600 flex items-center justify-center"
        >{labelFallback}</button>
      )}
    </div>
  );
}