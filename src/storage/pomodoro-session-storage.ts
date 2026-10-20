import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BreakType, PomodoroCycleState, TimerPhase, TimerState } from '@/domain/timer';

export const POMODORO_SESSION_STORAGE_KEY = 'pomodoro-cotopaxi:session:v1';
const POMODORO_SESSION_VERSION = 1;

export interface PomodoroSessionSnapshot {
  version: 1;
  focusTimer: TimerState;
  breakTimer: TimerState;
  cycle: PomodoroCycleState;
  breakType: BreakType | null;
  hasStartedSession: boolean;
  expiresAtEpochMs: number | null;
  notificationId: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isTimerState(value: unknown, phase: TimerPhase): value is TimerState {
  if (!isRecord(value) || value.phase !== phase) {
    return false;
  }

  const { status, initialDurationMs, remainingMs, startedAt } = value;
  if (
    (status !== 'paused' && status !== 'running' && status !== 'finished') ||
    !isFiniteNumber(initialDurationMs) ||
    initialDurationMs < 0 ||
    (phase === 'focus' && initialDurationMs === 0) ||
    !isFiniteNumber(remainingMs) ||
    remainingMs < 0
  ) {
    return false;
  }

  if (status === 'running') {
    return remainingMs > 0 && isFiniteNumber(startedAt);
  }

  if (startedAt !== null) {
    return false;
  }

  return status !== 'finished' || remainingMs === 0;
}

function isPomodoroCycleState(value: unknown): value is PomodoroCycleState {
  return (
    isRecord(value) &&
    Number.isInteger(value.pomodoroCount) &&
    typeof value.pomodoroCount === 'number' &&
    value.pomodoroCount >= 0 &&
    Number.isInteger(value.activeCycleLength) &&
    typeof value.activeCycleLength === 'number' &&
    value.activeCycleLength > 0 &&
    value.pomodoroCount < value.activeCycleLength &&
    Number.isInteger(value.configuredCycleLength) &&
    typeof value.configuredCycleLength === 'number' &&
    value.configuredCycleLength > 0 &&
    typeof value.hasStarted === 'boolean'
  );
}

function isPomodoroSessionSnapshot(value: unknown): value is PomodoroSessionSnapshot {
  if (
    !isRecord(value) ||
    value.version !== POMODORO_SESSION_VERSION ||
    !isTimerState(value.focusTimer, 'focus') ||
    !isTimerState(value.breakTimer, 'break') ||
    !isPomodoroCycleState(value.cycle) ||
    (value.breakType !== null && value.breakType !== 'short' && value.breakType !== 'long') ||
    typeof value.hasStartedSession !== 'boolean' ||
    (value.breakType === null && value.breakTimer.status === 'running') ||
    (value.breakType !== null &&
      (value.breakTimer.initialDurationMs <= 0 || value.focusTimer.status === 'running')) ||
    (value.expiresAtEpochMs !== null && !isFiniteNumber(value.expiresAtEpochMs)) ||
    (value.notificationId !== null && typeof value.notificationId !== 'string')
  ) {
    return false;
  }

  const runningTimerCount =
    Number(value.focusTimer.status === 'running') + Number(value.breakTimer.status === 'running');

  return (
    runningTimerCount <= 1 &&
    (runningTimerCount === 1
      ? value.expiresAtEpochMs !== null
      : value.expiresAtEpochMs === null && value.notificationId === null)
  );
}

function assertValidSnapshot(value: unknown): asserts value is PomodoroSessionSnapshot {
  if (
    isRecord(value) &&
    value.version === POMODORO_SESSION_VERSION &&
    isTimerState(value.focusTimer, 'focus') &&
    isTimerState(value.breakTimer, 'break') &&
    (value.focusTimer.status === 'running' || value.breakTimer.status === 'running') &&
    value.expiresAtEpochMs === null
  ) {
    throw new TypeError('A running session must have an expiry timestamp.');
  }

  if (!isPomodoroSessionSnapshot(value)) {
    throw new TypeError('Pomodoro session is invalid.');
  }
}

export async function loadPomodoroSession(): Promise<PomodoroSessionSnapshot | null> {
  const storedValue = await AsyncStorage.getItem(POMODORO_SESSION_STORAGE_KEY);
  if (storedValue === null) {
    return null;
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  if (
    isRecord(parsedValue) &&
    parsedValue.version !== POMODORO_SESSION_VERSION
  ) {
    throw new TypeError('Unsupported Pomodoro session version.');
  }

  if (!isPomodoroSessionSnapshot(parsedValue)) {
    throw new TypeError('Stored Pomodoro session is invalid.');
  }

  return parsedValue;
}

export async function savePomodoroSession(session: PomodoroSessionSnapshot): Promise<void> {
  assertValidSnapshot(session);
  await AsyncStorage.setItem(POMODORO_SESSION_STORAGE_KEY, JSON.stringify(session));
}
