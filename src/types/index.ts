export type SessionPhase = 'idle' | 'focus' | 'break';

export interface Checkpoint {
  id: string; // e.g. uuid or timestamp
  timestamp: number;
  status: 'completed' | 'skipped';
}

export interface Statistics {
  totalCompleted: number;
  totalSkipped: number;
  totalActiveTimeMs: number;
  currentStreak: number;
}

export interface SessionState {
  isActive: boolean;
  phase: SessionPhase; // idle -> focus -> break -> focus ...
  focusDurationMs: number; // typically 20 mins
  breakDurationMs: number; // typically 20 secs
  remainingMs: number; // countdown remaining
  endTime: number | null; // absolute timestamp when current phase ends
  lastTickTime: number | null; // for tracking active time
}

export interface AppSettings {
  focusTimeMinutes: number; // Default 20
  breakTimeSeconds: number; // Default 20
  totalSessionDurationMinutes: number; // Default infinite (e.g. 0 or very large)
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
}
