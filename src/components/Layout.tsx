import React, { useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { Header } from './Header';
import { ReminderModal } from './ReminderModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSession();

  // Apply dark mode to document root
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
      <ReminderModal />
    </div>
  );
};
