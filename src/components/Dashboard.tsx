import React from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

const formatTime = (ms: number) => {
  if (ms < 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const Dashboard: React.FC = () => {
  const { session, startSession, pauseSession, resumeSession, stopSession } = useSession();

  const isBreak = session.phase === 'break';
  const displayMs = session.remainingMs;

  const totalMs = isBreak ? session.breakDurationMs : session.focusDurationMs;
  const progress = 100 - (displayMs / totalMs) * 100;

  return (
    <div className="flex flex-col items-center p-8 bg-[var(--surface-color)] rounded-3xl shadow-sm border border-[var(--text-primary)]/5">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-medium text-[var(--text-primary)]/70 mb-1">
          {session.phase === 'idle' ? 'Ready to focus?' :
            session.phase === 'focus' ? 'Focus Session Active' : 'Break Time!'}
        </h2>
        {session.isActive && session.phase === 'focus' && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-100)] text-sm font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Timer Running
          </div>
        )}
      </div>

      {/* Main Timer Circle */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-10 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-[var(--text-primary)]/5"
            strokeWidth="6%"
            fill="none"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-[var(--color-primary-500)] transition-all ease-linear"
            style={{ transitionDuration: session.isActive ? '100ms' : '300ms' }}
            strokeWidth="6%"
            fill="none"
            strokeDasharray="283%" // 2 * PI * 45 ≈ 282.7
            strokeDashoffset={`${283 - (progress / 100) * 283}%`}
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-7xl font-bold tabular-nums tracking-tighter bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-primary)]/60 bg-clip-text text-transparent">
            {formatTime(displayMs)}
          </div>
          <div className="text-sm font-medium text-[var(--text-primary)]/50 mt-2 uppercase tracking-widest">
            {isBreak ? 'Seconds Left' : 'Minutes Left'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {session.phase === 'idle' || (!session.isActive && session.phase === 'focus' && session.remainingMs === session.focusDurationMs) ? (
          <button
            onClick={startSession}
            className="flex items-center gap-2 px-8 py-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[var(--color-primary-500)]/30 transition-all hover:-translate-y-1"
          >
            <Play fill="currentColor" size={24} />
            Start Session
          </button>
        ) : (
          <>
            {session.isActive ? (
              <button
                onClick={pauseSession}
                className="flex items-center justify-center w-16 h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl shadow-lg shadow-yellow-500/30 transition-all hover:-translate-y-1"
                title="Pause"
              >
                <Pause fill="currentColor" size={28} />
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="flex items-center justify-center w-16 h-16 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-2xl shadow-lg shadow-[var(--color-primary-500)]/30 transition-all hover:-translate-y-1"
                title="Resume"
              >
                <Play fill="currentColor" size={28} />
              </button>
            )}

            <button
              onClick={stopSession}
              className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-1"
              title="Stop & Reset"
            >
              <Square fill="currentColor" size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
