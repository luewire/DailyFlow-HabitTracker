'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const displayName = user?.username || 'User';

  return (
    <header className="px-5 pt-12 pb-4 md:px-8 md:max-w-4xl md:mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs font-bold tracking-widest mb-1"
            style={{ color: 'var(--accent-green)' }}
          >
            {getGreeting()}
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {displayName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="p-2 rounded-full transition-all hover:scale-105"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2"
            style={{
              background: 'linear-gradient(135deg, var(--accent-orange), #c96a48)',
              borderColor: 'var(--accent-orange)',
              color: 'white'
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
