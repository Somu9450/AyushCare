'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export default function RootPage() {
  const router = useRouter();
  const { hydrate, isAuthenticated, role, isLoading } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (role === 'hospital_admin') {
        router.replace('/admin/queue');
      } else {
        router.replace('/doctor');
      }
    }
  }, [isLoading, isAuthenticated, role, router]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
      <div className="flex items-center gap-3">
        <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-cyan-500 border-t-transparent" />
        <span>Authenticating clinical session...</span>
      </div>
    </div>
  );
}