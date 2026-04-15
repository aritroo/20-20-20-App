import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SessionState, AppSettings, Checkpoint, Statistics } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SessionContextProps {
  session: SessionState;
  settings: AppSettings;
  stats: Statistics;
  history: Checkpoint[];
  sessionStartTime: number | null;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  handleBreakResponse: (status: 'completed' | 'skipped') => void;
}

const defaultSettings: AppSettings = {
  focusTimeMinutes: 20,
  breakTimeSeconds: 20,
  totalSessionDurationMinutes: 0, // 0 = continuous
  soundEnabled: true,
  notificationsEnabled: true,
  darkMode: false,
};

const defaultStats: Statistics = {
  totalCompleted: 0,
  totalSkipped: 0,
  totalActiveTimeMs: 0,
  currentStreak: 0,
};

const initialSession: SessionState = {
  isActive: false,
  phase: 'idle',
  focusDurationMs: defaultSettings.focusTimeMinutes * 60 * 1000,
  breakDurationMs: defaultSettings.breakTimeSeconds * 1000,
  remainingMs: defaultSettings.focusTimeMinutes * 60 * 1000,
  endTime: null,
  lastTickTime: null,
};

let audioCtx: AudioContext | null = null;
const initAudio = () => {
  if (typeof window !== 'undefined') {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume().catch(console.warn);
    }
  }
};

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('20-20-20-settings', defaultSettings);
  const [stats, setStats] = useLocalStorage<Statistics>('20-20-20-stats', defaultStats);
  const [history, setHistory] = useLocalStorage<Checkpoint[]>('20-20-20-history', []);

  const [session, setSession] = useState<SessionState>({
    ...initialSession,
    focusDurationMs: settings.focusTimeMinutes * 60 * 1000,
    breakDurationMs: settings.breakTimeSeconds * 1000,
    remainingMs: settings.focusTimeMinutes * 60 * 1000,
  });

  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const playChime = () => {
    if (settings.soundEnabled) {
      try {
        initAudio();
        const ctx = audioCtx;
        if (!ctx) return;

        const now = ctx.currentTime;
        // Ding-Dong doorbell pattern
        const notes = [
          { pitch: 784.00, start: now, duration: 1.2 },       // G5 (Higher note)
          { pitch: 659.25, start: now + 0.5, duration: 1.8 }  // E5 (Lower note)
        ];

        notes.forEach(({ pitch, start, duration }) => {
          const fundamental = ctx.createOscillator();
          const overtone = ctx.createOscillator();
          const gainNode = ctx.createGain();

          fundamental.connect(gainNode);
          overtone.connect(gainNode);
          gainNode.connect(ctx.destination);

          fundamental.type = 'sine';
          fundamental.frequency.setValueAtTime(pitch, start);

          overtone.type = 'sine';
          overtone.frequency.setValueAtTime(pitch * 2.76, start); // subtle inharmonic overtone for bell character

          // Bell envelope: instant hit, exponential decay
          gainNode.gain.setValueAtTime(0, start);
          gainNode.gain.linearRampToValueAtTime(1.0, start + 0.02); // sharp attack
          gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration); // long fade out

          fundamental.start(start);
          overtone.start(start);
          fundamental.stop(start + duration);
          overtone.stop(start + duration);
        });
      } catch (e) {
        console.warn('Audio play failed:', e);
      }
    }
  };

  const notifyBreak = () => {
    playChime();
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Time to rest your eyes 👀', {
        body: 'Look 20 feet away for 20 seconds.',
        icon: '/vite.svg'
      });
    }
  };

  const notifyComplete = () => {
    playChime();
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Completed 🎉', {
        body: 'Great job! You completed your focus session.',
        icon: '/vite.svg'
      });
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Timer effect
  useEffect(() => {
    let interval: number;

    if (session.isActive && session.endTime) {
      interval = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, session.endTime! - now);

        let delta = 0;
        if (session.lastTickTime) {
          delta = now - session.lastTickTime;
        }

        setSession(prev => ({
          ...prev,
          remainingMs: remaining,
          lastTickTime: now
        }));

        setStats(prev => ({
          ...prev,
          totalActiveTimeMs: prev.totalActiveTimeMs + delta
        }));

        // Check if limit reached for Total session duration
        if (settings.totalSessionDurationMinutes > 0 && sessionStartTime) {
          const totalLimitMs = settings.totalSessionDurationMinutes * 60 * 1000;
          if (now - sessionStartTime >= totalLimitMs) {
            notifyComplete();
            stopSession();
            return;
          }
        }

        if (remaining <= 0) {
          if (session.phase === 'focus') {
            // Switch to break
            notifyBreak();
            setSession(prev => ({
              ...prev,
              phase: 'break',
              endTime: Date.now() + prev.breakDurationMs,
              remainingMs: prev.breakDurationMs
            }));
          } else if (session.phase === 'break') {
            // Break finished automatically? 
            // We wait for the user to confirm to maintain the checkpoint logic requested.
            // If timer runs out for break, it just stays at 0 until they click ✅ Completed or ⏭ Skip
            // But actually, it can automatically jump back if we want. Wait, the req says "Start visible 20-second break timer. After break is completed or skipped...".
            // We'll keep it at 0 and wait for manual action for checkpoint.
            // Or we just wait for them to click the buttons.
          }
        }
      }, 100); // 100ms for smooth progress bar update
    }

    return () => clearInterval(interval);
  }, [session.isActive, session.endTime, session.phase, session.lastTickTime, settings.totalSessionDurationMinutes, sessionStartTime]);

  const startSession = useCallback(() => {
    requestNotificationPermission();
    if (settings.soundEnabled) {
      initAudio();
    }
    const focusDuration = settings.focusTimeMinutes * 60 * 1000;

    setSessionStartTime(Date.now());
    setSession({
      isActive: true,
      phase: 'focus',
      focusDurationMs: focusDuration,
      breakDurationMs: settings.breakTimeSeconds * 1000,
      remainingMs: focusDuration,
      endTime: Date.now() + focusDuration,
      lastTickTime: Date.now()
    });
  }, [settings]);

  const pauseSession = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isActive: false,
      endTime: null,
      lastTickTime: null
    }));
  }, []);

  const resumeSession = useCallback(() => {
    if (settings.soundEnabled) {
      initAudio();
    }
    setSession(prev => ({
      ...prev,
      isActive: true,
      endTime: Date.now() + prev.remainingMs,
      lastTickTime: Date.now()
    }));
  }, []);

  const stopSession = useCallback(() => {
    setSessionStartTime(null);
    setSession({
      isActive: false,
      phase: 'idle',
      focusDurationMs: settings.focusTimeMinutes * 60 * 1000,
      breakDurationMs: settings.breakTimeSeconds * 1000,
      remainingMs: settings.focusTimeMinutes * 60 * 1000,
      endTime: null,
      lastTickTime: null
    });
  }, [settings]);

  const handleBreakResponse = useCallback((status: 'completed' | 'skipped') => {
    const cp: Checkpoint = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      status
    };

    setHistory(prev => [cp, ...prev]);

    if (status === 'completed') {
      setStats(prev => ({
        ...prev,
        totalCompleted: prev.totalCompleted + 1,
        currentStreak: prev.currentStreak + 1
      }));
    } else {
      setStats(prev => ({
        ...prev,
        totalSkipped: prev.totalSkipped + 1,
        currentStreak: 0
      }));
    }

    // Auto restart next 20m cycle
    const focusDuration = settings.focusTimeMinutes * 60 * 1000;
    setSession(prev => ({
      ...prev,
      phase: 'focus',
      remainingMs: focusDuration,
      endTime: Date.now() + focusDuration,
      lastTickTime: Date.now()
    }));
  }, [settings, setHistory, setStats]);

  return (
    <SessionContext.Provider
      value={{
        session,
        settings,
        stats,
        history,
        sessionStartTime,
        updateSettings,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        handleBreakResponse
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
