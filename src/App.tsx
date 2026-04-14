import React from 'react';
import { SessionProvider } from './contexts/SessionContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StatisticsPanel } from './components/StatisticsPanel';
import { HistoryTimeline } from './components/HistoryTimeline';
import { Clock } from 'lucide-react';
import { useSession } from './contexts/SessionContext';

// Settings Component for adjusting custom durations
const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, session } = useSession();

  return (
    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--text-primary)]/5 mt-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Clock size={20} className="text-[var(--color-primary-500)]" />
        Session Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]/70">
            Total Session Goal (Hours)
          </label>
          <select 
            disabled={session.isActive}
            value={settings.totalSessionDurationMinutes / 60}
            onChange={(e) => updateSettings({ totalSessionDurationMinutes: Number(e.target.value) * 60 })}
            className="w-full bg-[var(--bg-color)] border border-[var(--text-primary)]/10 text-[var(--text-primary)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] disabled:opacity-50"
          >
            <option value="0">Continuous (No End)</option>
            <option value="1">1 Hour</option>
            <option value="2">2 Hours</option>
            <option value="4">4 Hours</option>
            <option value="8">8 Hours</option>
          </select>
          <p className="text-xs text-[var(--text-primary)]/50 mt-1">
             Select the total duration you want to work today. 
          </p>
        </div>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <Dashboard />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <StatisticsPanel />
          <SettingsPanel />
          <HistoryTimeline />
        </div>
      </div>
    </Layout>
  );
};

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
