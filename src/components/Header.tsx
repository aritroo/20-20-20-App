import React from 'react';
import { Eye, Moon, Sun, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

export const Header: React.FC = () => {
  const { settings, updateSettings } = useSession();

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-[var(--surface-color)]/80 border-b border-[var(--text-primary)]/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary-500)] rounded-xl text-white">
            <Eye size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] bg-clip-text text-transparent">
            20-20-20 Reminder
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="p-2 rounded-full hover:bg-[var(--text-primary)]/5 transition-colors"
            title="Toggle Sound"
          >
            {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button 
            onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            className="p-2 rounded-full hover:bg-[var(--text-primary)]/5 transition-colors"
            title="Toggle Notifications"
          >
            {settings.notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </button>

          <button 
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="p-2 rounded-full hover:bg-[var(--text-primary)]/5 transition-colors"
            title="Toggle Theme"
          >
            {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
