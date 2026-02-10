'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="px-5 pt-12 pb-4">
          <div className="h-4 w-24 rounded animate-pulse mb-2" style={{ background: 'var(--bg-card)' }}></div>
          <div className="h-7 w-36 rounded animate-pulse" style={{ background: 'var(--bg-card)' }}></div>
        </div>
        <main className="px-5 py-4">
          <div className="space-y-4">
            <div className="h-12 w-full rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }}></div>
            <div className="h-32 w-full rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }}></div>
            <div className="h-20 w-full rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }}></div>
            <div className="h-20 w-full rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }}></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      <main className="px-5 pb-28 md:px-8 md:max-w-4xl md:mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
