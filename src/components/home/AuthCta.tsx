'use client';

import Link from 'next/link';
import { useRecoilValue } from 'recoil';
import { authState } from '@/lib/atoms';
import { Users, Loader2 } from 'lucide-react';

export default function AuthCta() {
  const { isAuthenticated, isLoading } = useRecoilValue(authState);

  if (isLoading) {
    return (
      <button
        disabled
        className="border border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold opacity-70 cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
      >
        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
        Checking session...
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <Link
        href="/portal"
        className="border border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
      >
        <Users className="w-4 h-4 md:w-5 md:h-5" />
        Access Patient Portal
      </Link>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="border border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
    >
      <Users className="w-4 h-4 md:w-5 md:h-5" />
      Sign In to Continue
    </Link>
  );
}
