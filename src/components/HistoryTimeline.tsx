import React from 'react';
import { useSession } from '../contexts/SessionContext';
import { Check, SkipForward } from 'lucide-react';

export const HistoryTimeline: React.FC = () => {
  const { history } = useSession();

  if (history.length === 0) {
    return (
      <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--text-primary)]/5 text-center text-[var(--text-primary)]/50 mt-4">
        No checkpoints yet. Start your first session!
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--text-primary)]/5 mt-4">
      <h3 className="text-lg font-bold mb-4">Session History</h3>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {history.map((cp, idx) => {
          const date = new Date(cp.timestamp);
          const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isCompleted = cp.status === 'completed';

          return (
            <div key={cp.id} className="flex flex-row items-center gap-4 relative">
              {idx !== history.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-[-16px] w-[2px] bg-[var(--text-primary)]/10 z-0"></div>
              )}
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-600/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400'}`}>
                {isCompleted ? <Check size={16} /> : <SkipForward size={16} />}
              </div>
              
              <div className="flex-1 bg-[var(--text-primary)]/5 backdrop-blur-sm px-4 py-3 rounded-xl flex justify-between items-center">
                <span className="font-medium text-[var(--text-primary)]/80">
                  {isCompleted ? 'Completed Checkpoint' : 'Skipped Checkpoint'}
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]/50 tabular-nums">
                  {time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
