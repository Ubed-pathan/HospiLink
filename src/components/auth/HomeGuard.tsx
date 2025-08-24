'use client';

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { authState } from '@/lib/atoms';
import { useRouter } from 'next/navigation';

export default function HomeGuard() {
  const { isAuthenticated, isLoading } = useRecoilValue(authState);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/auth/signin');
  }, [isAuthenticated, isLoading, router]);

  return null;
}
