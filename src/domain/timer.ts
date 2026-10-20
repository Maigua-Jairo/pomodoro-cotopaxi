export const DEFAULT_FOCUS_DURATION_MS = 25 * 60 * 1_000;
export const DEFAULT_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 15;
export const DEFAULT_POMODORO_CYCLE_LENGTH = 4;

export type TimerPhase = 'focus' | 'break';
export type TimerStatus = 'paused' | 'running' | 'finished';
export type BreakType = 'short' | 'long';

export interface PomodoroCycleState {
  pomodoroCount: number;
  activeCycleLength: number;
  configuredCycleLength: number;
  hasStarted: boolean;
}

export interface TimerState {
  phase: TimerPhase;
  status: TimerStatus;
  initialDurationMs: number;
  remainingMs: number;
  startedAt: number | null;
}

export type BreakCompletionAction = 'start-focus' | 'return-home';

export interface FocusCompletionResult {
  cycle: PomodoroCycleState;
  breakType: BreakType;
  breakTimer: TimerState;
}

export function isValidPomodoroCycleLength(cycleLength: number): boolean {
  return Number.isInteger(cycleLength) && cycleLength > 0;
}

export function createPomodoroCycle(
  pomodoroCount = 0,
  cycleLength = DEFAULT_POMODORO_CYCLE_LENGTH,
): PomodoroCycleState {
  if (!isValidPomodoroCycleLength(cycleLength)) {
    throw new RangeError('Pomodoro cycle length must be a positive integer.');
  }

  if (!Number.isInteger(pomodoroCount) || pomodoroCount < 0 || pomodoroCount >= cycleLength) {
    throw new RangeError('Pomodoro count must be a non-negative integer below the cycle length.');
  }

  return {
    pomodoroCount,
    activeCycleLength: cycleLength,
    configuredCycleLength: cycleLength,
    hasStarted: pomodoroCount > 0,
  };
}

export function configurePomodoroCycle(
  cycle: PomodoroCycleState,
  configuredCycleLength: number,
): PomodoroCycleState {
  if (!isValidPomodoroCycleLength(configuredCycleLength)) {
    throw new RangeError('Pomodoro cycle length must be a positive integer.');
  }

  return {
    ...cycle,
    activeCycleLength: cycle.hasStarted ? cycle.activeCycleLength : configuredCycleLength,
    configuredCycleLength,
  };
}

export function startPomodoroCycle(cycle: PomodoroCycleState): PomodoroCycleState {
  return { ...cycle, hasStarted: true };
}

export function completePomodoroCycle(
  cycle: PomodoroCycleState,
): { cycle: PomodoroCycleState; breakType: BreakType } {
  const nextPomodoroCount = cycle.pomodoroCount + 1;
  const breakType =
    nextPomodoroCount >= cycle.activeCycleLength ? 'long' : 'short';

  return {
    cycle: {
      ...cycle,
      pomodoroCount: breakType === 'long' ? 0 : nextPomodoroCount,
      hasStarted: true,
    },
    breakType,
  };
}

export function completePomodoroBreak(
  cycle: PomodoroCycleState,
  breakType: BreakType,
): PomodoroCycleState {
  if (breakType === 'short') {
    return cycle;
  }

  return {
    ...cycle,
    activeCycleLength: cycle.configuredCycleLength,
    hasStarted: false,
  };
}

export function completeFocusPhase(
  focusTimer: TimerState,
  cycle: PomodoroCycleState,
  shortBreakMinutes = DEFAULT_SHORT_BREAK_MINUTES,
  longBreakMinutes = DEFAULT_LONG_BREAK_MINUTES,
): FocusCompletionResult | null {
  if (focusTimer.phase !== 'focus' || focusTimer.status !== 'finished') {
    return null;
  }

  const completion = completePomodoroCycle(cycle);
  const breakMinutes =
    completion.breakType === 'long' ? longBreakMinutes : shortBreakMinutes;

  return {
    ...completion,
    breakTimer: createPreparedBreakTimer(breakMinutes),
  };
}

function assertPositiveDuration(durationMs: number): void {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new RangeError('Timer duration must be a positive finite number.');
  }
}

function assertFiniteTimestamp(timestamp: number): void {
  if (!Number.isFinite(timestamp)) {
    throw new RangeError('Timer timestamp must be finite.');
  }
}

export function createFocusTimer(
  initialDurationMs = DEFAULT_FOCUS_DURATION_MS,
): TimerState {
  assertPositiveDuration(initialDurationMs);

  return {
    phase: 'focus',
    status: 'paused',
    initialDurationMs,
    remainingMs: initialDurationMs,
    startedAt: null,
  };
}

export function createBreakTimer(): TimerState {
  return {
    phase: 'break',
    status: 'paused',
    initialDurationMs: 0,
    remainingMs: 0,
    startedAt: null,
  };
}

export function createPreparedBreakTimer(
  minutes: number = DEFAULT_SHORT_BREAK_MINUTES,
): TimerState {
  assertPositiveDuration(minutes * 60 * 1_000);

  return {
    phase: 'break',
    status: 'paused',
    initialDurationMs: minutes * 60 * 1_000,
    remainingMs: minutes * 60 * 1_000,
    startedAt: null,
  };
}

export function prepareFocusAfterBreak(
  focusTimer: TimerState,
  focusDurationMs: number = focusTimer.initialDurationMs,
): TimerState {
  if (focusTimer.phase !== 'focus') {
    throw new TypeError('Break completion requires a focus timer.');
  }

  return createFocusTimer(focusDurationMs);
}

export function advancePomodoroCycle(completedPomodoros: number, cycleLength: number): number {
  if (!Number.isInteger(completedPomodoros) || completedPomodoros < 0) {
    return 0;
  }

  if (!Number.isInteger(cycleLength) || cycleLength <= 0) {
    return 0;
  }

  const normalizedCount = completedPomodoros % cycleLength;
  return normalizedCount === cycleLength - 1 ? 0 : normalizedCount + 1;
}

export function getNextBreakType(completedPomodoros: number, cycleLength: number): BreakType {
  return advancePomodoroCycle(completedPomodoros, cycleLength) === 0 ? 'long' : 'short';
}

export function startTimer(timer: TimerState, now: number): TimerState {
  assertFiniteTimestamp(now);

  if (timer.status !== 'paused' || timer.remainingMs <= 0) {
    return timer;
  }

  return {
    ...timer,
    status: 'running',
    startedAt: now,
  };
}

export function pauseTimer(timer: TimerState, now: number): TimerState {
  if (timer.status !== 'running') {
    return timer;
  }

  const reconciledTimer = reconcileTimer(timer, now);

  if (reconciledTimer.status === 'finished') {
    return reconciledTimer;
  }

  return {
    ...reconciledTimer,
    status: 'paused',
    startedAt: null,
  };
}

export function reconcileTimer(timer: TimerState, now: number): TimerState {
  assertFiniteTimestamp(now);

  if (timer.status !== 'running' || timer.startedAt === null) {
    return timer;
  }

  const elapsedMs = Math.max(0, now - timer.startedAt);
  const remainingMs = Math.max(0, timer.remainingMs - elapsedMs);

  if (remainingMs === 0) {
    return {
      ...timer,
      status: 'finished',
      remainingMs: 0,
      startedAt: null,
    };
  }

  return {
    ...timer,
    remainingMs,
    startedAt: now,
  };
}

export function restoreTimerFromExpiry(
  timer: TimerState,
  expiresAtEpochMs: number | null,
  nowEpochMs: number,
  monotonicNow: number,
): TimerState {
  assertFiniteTimestamp(nowEpochMs);
  assertFiniteTimestamp(monotonicNow);

  if (timer.status !== 'running') {
    return timer;
  }

  if (expiresAtEpochMs === null) {
    throw new TypeError('A running timer must have a saved expiry timestamp.');
  }
  assertFiniteTimestamp(expiresAtEpochMs);

  const remainingMs = Math.max(0, expiresAtEpochMs - nowEpochMs);
  if (remainingMs === 0) {
    return {
      ...timer,
      status: 'finished',
      remainingMs: 0,
      startedAt: null,
    };
  }

  return {
    ...timer,
    remainingMs,
    startedAt: monotonicNow,
  };
}

export function resetTimer(timer: TimerState): TimerState {
  return {
    ...timer,
    status: 'paused',
    remainingMs: timer.initialDurationMs,
    startedAt: null,
  };
}

export function getFocusTimerAfterBreak(
  focusTimer: TimerState,
  action: BreakCompletionAction,
  now: number,
): TimerState {
  if (focusTimer.phase !== 'focus') {
    throw new TypeError('Break completion requires a focus timer.');
  }

  const resetFocusTimer = resetTimer(focusTimer);
  return action === 'start-focus' ? startTimer(resetFocusTimer, now) : resetFocusTimer;
}

export function cancelReset(timer: TimerState): TimerState {
  return timer;
}

export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
