import {
  configurePomodoroCycle,
  createFocusTimer,
  createPreparedBreakTimer,
  type BreakType,
  type PomodoroCycleState,
  type TimerState,
} from './timer';

export type SettingsField = 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'cycleLength';
export type PomodoroSettings = Record<SettingsField, number>;
export type SettingsInput = Record<SettingsField, string>;
export type SettingsErrors = Partial<Record<SettingsField, string>>;

export type SettingsValidationResult =
  | { success: true; settings: PomodoroSettings }
  | { success: false; errors: SettingsErrors };

export interface SettingsSession {
  focusTimer: TimerState;
  breakTimer: TimerState;
  breakType: BreakType | null;
  cycle: PomodoroCycleState;
}

export interface AppliedSettingsSession {
  focusTimer: TimerState;
  breakTimer: TimerState;
  cycle: PomodoroCycleState;
  cycleGoalReached: boolean;
}

export const SETTINGS_FIELDS: readonly SettingsField[] = [
  'focusMinutes',
  'shortBreakMinutes',
  'longBreakMinutes',
  'cycleLength',
];

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cycleLength: 4,
};

export const SETTINGS_RANGES: Record<SettingsField, { min: number; max: number }> = {
  focusMinutes: { min: 1, max: 120 },
  shortBreakMinutes: { min: 1, max: 30 },
  longBreakMinutes: { min: 1, max: 60 },
  cycleLength: { min: 4, max: 8 },
};

const MINUTE_MS = 60 * 1_000;

function isWithinRange(field: SettingsField, value: unknown): value is number {
  const { min, max } = SETTINGS_RANGES[field];
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export function getSettingsRangeMessage(field: SettingsField): string {
  const { min, max } = SETTINGS_RANGES[field];
  return `Ingresa un número entero entre ${min} y ${max}.`;
}

export function isValidSettings(value: unknown): value is PomodoroSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return SETTINGS_FIELDS.every((field) => isWithinRange(field, record[field]));
}

export function validateSettingsInput(input: SettingsInput): SettingsValidationResult {
  const errors: SettingsErrors = {};
  const parsed: Partial<PomodoroSettings> = {};

  for (const field of SETTINGS_FIELDS) {
    const text = input[field].trim();
    const value = /^\d+$/.test(text) ? Number(text) : Number.NaN;
    if (isWithinRange(field, value)) {
      parsed[field] = value;
    } else {
      errors[field] = getSettingsRangeMessage(field);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, settings: parsed as PomodoroSettings };
}

function isPrepared(timer: TimerState): boolean {
  return timer.status === 'paused' && timer.remainingMs === timer.initialDurationMs;
}

function applyCycleLength(
  cycle: PomodoroCycleState,
  cycleLength: number,
): { cycle: PomodoroCycleState; cycleGoalReached: boolean } {
  const configuredCycle = configurePomodoroCycle(cycle, cycleLength);
  if (!cycle.hasStarted || cycleLength > cycle.pomodoroCount) {
    return { cycle: configuredCycle, cycleGoalReached: false };
  }

  return {
    cycle: { ...configuredCycle, activeCycleLength: cycle.pomodoroCount + 1 },
    cycleGoalReached: cycleLength === cycle.pomodoroCount,
  };
}

export function hasDeferredDurationChange(
  session: SettingsSession,
  previous: PomodoroSettings,
  next: PomodoroSettings,
): boolean {
  if (session.breakType === null) {
    return (
      session.focusTimer.status !== 'finished' &&
      !isPrepared(session.focusTimer) &&
      previous.focusMinutes !== next.focusMinutes
    );
  }

  const field = session.breakType === 'long' ? 'longBreakMinutes' : 'shortBreakMinutes';
  return !isPrepared(session.breakTimer) && previous[field] !== next[field];
}

export function applySettingsToSession(
  session: SettingsSession,
  settings: PomodoroSettings,
): AppliedSettingsSession {
  const focusTimer = isPrepared(session.focusTimer)
    ? createFocusTimer(settings.focusMinutes * MINUTE_MS)
    : session.focusTimer;
  const breakTimer =
    session.breakType !== null && isPrepared(session.breakTimer)
      ? createPreparedBreakTimer(
          session.breakType === 'long' ? settings.longBreakMinutes : settings.shortBreakMinutes,
        )
      : session.breakTimer;

  return {
    focusTimer,
    breakTimer,
    ...applyCycleLength(session.cycle, settings.cycleLength),
  };
}
