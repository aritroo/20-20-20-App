import React, { useEffect, useState } from 'react';
import { Check, SkipForward, EyeOff } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

const quotes = [
  "Your eyes are windows to the soul, give them a break.",
  "Look far away to see things clearer.",
  "20 feet away, 20 seconds, for another 20 minutes of focus.",
  "Relax your eye muscles, they've been working hard.",
  "Blink a few times and breathe deeply."
];

export const ReminderModal: React.FC = () => {
  const { session, handleBreakResponse } = useSession();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (session.phase === 'break') {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  }, [session.phase]);

  if (session.phase !== 'break') return null;

  const secondsRemaining = Math.ceil(session.remainingMs / 1000);
  const progress = 100 - (session.remainingMs / session.breakDurationMs) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--surface-color)] p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] rounded-full flex items-center justify-center text-[var(--color-primary-600)] dark:text-[var(--color-primary-500)] animate-pulse">
            <EyeOff size={40} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Time to rest your eyes 👀</h2>
            <p className="text-[var(--text-primary)]/70">
              Look at something 20 feet away for 20 seconds.
            </p>
          </div>

          <div className="w-32 h-32 relative flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                className="stroke-[var(--color-primary-100)] dark:stroke-[var(--text-primary)]/10"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                className="stroke-[var(--color-primary-500)] transition-all duration-100 ease-linear"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-3xl font-bold tabular-nums">
              {secondsRemaining}s
            </div>
          </div>

          <p className="italic text-sm text-[var(--text-primary)]/60">
            "{quote}"
          </p>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => handleBreakResponse('skipped')}
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 font-medium transition-all"
            >
              <SkipForward size={20} />
              Skip
            </button>
            <button
              onClick={() => handleBreakResponse('completed')}
              className="flex-[2] flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] font-semibold shadow-lg shadow-[var(--color-primary-500)]/30 transition-all hover:-translate-y-0.5"
            >
              <Check size={20} />
              Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
