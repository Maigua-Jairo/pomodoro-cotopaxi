import { describe, expect, it, jest } from '@jest/globals';

import {
  DEFAULT_FOCUS_DURATION_MS,
  DEFAULT_LONG_BREAK_MINUTES,
  DEFAULT_POMODORO_CYCLE_LENGTH,
  DEFAULT_SHORT_BREAK_MINUTES,
  advancePomodoroCycle,
  cancelReset,
  completeFocusPhase,
  completePomodoroBreak,
  configurePomodoroCycle,
  createBreakTimer,
  createFocusTimer,
  createPomodoroCycle,
  createPreparedBreakTimer,
  formatRemainingTime,
  getFocusTimerAfterBreak,
  getNextBreakType,
  pauseTimer,
  prepareFocusAfterBreak,
  reconcileTimer,
  resetTimer,
  restoreTimerFromExpiry,
  startPomodoroCycle,
  startTimer,
  stopBreakPhase,
  stopFocusPhase,
} from '../timer';

const STARTED_AT = 10_000;
const FOCUS_DURATION_MS = 25 * 60 * 1_000;

describe('focus timer', () => {
  it('starts paused with the default focus duration', () => {
    expect(createFocusTimer()).toEqual({
      phase: 'focus',
      status: 'paused',
      initialDurationMs: DEFAULT_FOCUS_DURATION_MS,
      remainingMs: DEFAULT_FOCUS_DURATION_MS,
      startedAt: null,
    });

  });

  it('starts a paused timer from its remaining time', () => {
    const timer = createFocusTimer(FOCUS_DURATION_MS);

    expect(startTimer(timer, STARTED_AT)).toEqual({
      ...timer,
      status: 'running',
      startedAt: STARTED_AT,
    });
  });

  describe('break timer', () => {
    it('prepares a short break with the default duration', () => {
      expect(createPreparedBreakTimer(DEFAULT_SHORT_BREAK_MINUTES)).toEqual({
        phase: 'break',
        status: 'paused',
        initialDurationMs: DEFAULT_SHORT_BREAK_MINUTES * 60 * 1_000,
        remainingMs: DEFAULT_SHORT_BREAK_MINUTES * 60 * 1_000,
        startedAt: null,
      });
    });

    it('prepares a long break with the default duration', () => {
      expect(createPreparedBreakTimer(DEFAULT_LONG_BREAK_MINUTES)).toEqual({
        phase: 'break',
        status: 'paused',
        initialDurationMs: DEFAULT_LONG_BREAK_MINUTES * 60 * 1_000,
        remainingMs: DEFAULT_LONG_BREAK_MINUTES * 60 * 1_000,
        startedAt: null,
      });
    });

    it('resets the cycle after the last pomodoro of the cycle', () => {
      expect(advancePomodoroCycle(2, DEFAULT_POMODORO_CYCLE_LENGTH)).toBe(3);
      expect(advancePomodoroCycle(3, DEFAULT_POMODORO_CYCLE_LENGTH)).toBe(0);
      expect(getNextBreakType(2, DEFAULT_POMODORO_CYCLE_LENGTH)).toBe('short');
      expect(getNextBreakType(3, DEFAULT_POMODORO_CYCLE_LENGTH)).toBe('long');
    });

    it('starts with zero remaining time and stays paused', () => {
      expect(createBreakTimer()).toEqual({
        phase: 'break',
        status: 'paused',
        initialDurationMs: 0,
        remainingMs: 0,
        startedAt: null,
      });
    });

    it('finishes the break at zero', () => {
      const breakTimer = startTimer(createPreparedBreakTimer(5), STARTED_AT);

      expect(reconcileTimer(breakTimer, STARTED_AT + 5 * 60 * 1_000)).toEqual({
        ...breakTimer,
        status: 'finished',
        remainingMs: 0,
        startedAt: null,
      });
    });

    it('starts focus at its initial duration after a completed break', () => {
      const focusTimer = pauseTimer(
        startTimer(createFocusTimer(30 * 60 * 1_000), STARTED_AT),
        STARTED_AT + 60_000,
      );

      expect(getFocusTimerAfterBreak(focusTimer, 'start-focus', STARTED_AT + 6 * 60 * 1_000)).toEqual({
        phase: 'focus',
        status: 'running',
        initialDurationMs: 30 * 60 * 1_000,
        remainingMs: 30 * 60 * 1_000,
        startedAt: STARTED_AT + 6 * 60 * 1_000,
      });
    });

    it('returns to focus paused at its initial duration after a completed break', () => {
      const focusTimer = pauseTimer(
        startTimer(createFocusTimer(30 * 60 * 1_000), STARTED_AT),
        STARTED_AT + 60_000,
      );

      expect(getFocusTimerAfterBreak(focusTimer, 'return-home', STARTED_AT)).toEqual({
        phase: 'focus',
        status: 'paused',
        initialDurationMs: 30 * 60 * 1_000,
        remainingMs: 30 * 60 * 1_000,
        startedAt: null,
      });
    });
  });

  it('does not change an already running timer when started again', () => {
    const runningTimer = startTimer(createFocusTimer(FOCUS_DURATION_MS), STARTED_AT);

    expect(startTimer(runningTimer, STARTED_AT + 5_000)).toBe(runningTimer);
  });

  it('preserves the remaining time when paused', () => {
    const runningTimer = startTimer(createFocusTimer(FOCUS_DURATION_MS), STARTED_AT);

    expect(pauseTimer(runningTimer, STARTED_AT + 30_000)).toEqual({
      ...runningTimer,
      status: 'paused',
      remainingMs: FOCUS_DURATION_MS - 30_000,
      startedAt: null,
    });
  });

  it('resumes from the remaining time after a pause', () => {
    const runningTimer = startTimer(createFocusTimer(FOCUS_DURATION_MS), STARTED_AT);
    const pausedTimer = pauseTimer(runningTimer, STARTED_AT + 30_000);

    expect(startTimer(pausedTimer, STARTED_AT + 50_000)).toEqual({
      ...pausedTimer,
      status: 'running',
      startedAt: STARTED_AT + 50_000,
    });
  });

  describe('restoring a timer from its saved expiry', () => {
      it('restores a running timer with time remaining from the epoch expiry', () => {
        const runningTimer = startTimer(createFocusTimer(60_000), STARTED_AT);

        expect(
          restoreTimerFromExpiry(runningTimer, STARTED_AT + 60_000, STARTED_AT + 20_000, 90_000),
        ).toEqual({
          ...runningTimer,
          remainingMs: 40_000,
          startedAt: 90_000,
        });
      });

      it('marks the timer finished when the expiry has passed and remains finished on reconciliation', () => {
        const runningTimer = startTimer(createFocusTimer(60_000), STARTED_AT);
        const restoredTimer = restoreTimerFromExpiry(
          runningTimer,
          STARTED_AT + 60_000,
          STARTED_AT + 60_000,
          90_000,
        );

        expect(restoredTimer).toEqual({
          ...runningTimer,
          status: 'finished',
          remainingMs: 0,
          startedAt: null,
        });
        expect(
          restoreTimerFromExpiry(restoredTimer, null, STARTED_AT + 61_000, 91_000),
        ).toBe(restoredTimer);
      });

      it('preserves a paused timer and its remaining time', () => {
        const pausedTimer = pauseTimer(
          startTimer(createFocusTimer(60_000), STARTED_AT),
          STARTED_AT + 20_000,
        );

        expect(
          restoreTimerFromExpiry(pausedTimer, null, STARTED_AT + 30_000, 90_000),
        ).toBe(pausedTimer);
      });

      it('prepares only one phase transition when a restored focus timer has expired', () => {
        const cycle = startPomodoroCycle(createPomodoroCycle());
        const expiredFocusTimer = restoreTimerFromExpiry(
          startTimer(createFocusTimer(60_000), STARTED_AT),
          STARTED_AT + 60_000,
          STARTED_AT + 61_000,
          90_000,
        );
        const completion = completeFocusPhase(expiredFocusTimer, cycle);

        expect(completion?.cycle.pomodoroCount).toBe(1);
        expect(completion?.breakTimer.status).toBe('paused');
        expect(
          completion === null
            ? null
            : completeFocusPhase(completion.breakTimer, completion.cycle),
        ).toBeNull();
      });
    });

  it('resets to the initial duration and leaves the timer paused', () => {
    const runningTimer = startTimer(createFocusTimer(FOCUS_DURATION_MS), STARTED_AT);
    const elapsedTimer = reconcileTimer(runningTimer, STARTED_AT + 30_000);

    expect(resetTimer(elapsedTimer)).toEqual({
      ...elapsedTimer,
      status: 'paused',
      remainingMs: FOCUS_DURATION_MS,
      startedAt: null,
    });
  });

  it('resets a paused timer to its initial duration', () => {
    const runningTimer = startTimer(createFocusTimer(FOCUS_DURATION_MS), STARTED_AT);
    const pausedTimer = pauseTimer(runningTimer, STARTED_AT + 30_000);

    expect(resetTimer(pausedTimer)).toEqual({
      ...pausedTimer,
      status: 'paused',
      remainingMs: FOCUS_DURATION_MS,
      startedAt: null,
    });
  });

  it.each(['running', 'paused'] as const)(
    'preserves a %s timer when reset is cancelled',
    (status) => {
      const timer = createFocusTimer(FOCUS_DURATION_MS);
      const runningTimer = startTimer(timer, STARTED_AT);
      const currentTimer =
        status === 'running'
          ? runningTimer
          : pauseTimer(runningTimer, STARTED_AT + 30_000);

      expect(cancelReset(currentTimer)).toBe(currentTimer);
    },
  );

  it('finishes at zero without producing a negative remaining time', () => {
    const runningTimer = startTimer(createFocusTimer(1_000), STARTED_AT);

    expect(reconcileTimer(runningTimer, STARTED_AT + 2_000)).toEqual({
      ...runningTimer,
      status: 'finished',
      remainingMs: 0,
      startedAt: null,
    });
  });

  it('formats remaining milliseconds as MM:SS, rounding up partial seconds', () => {
    expect(formatRemainingTime(0)).toBe('00:00');
    expect(formatRemainingTime(60_001)).toBe('01:01');
    expect(formatRemainingTime(1)).toBe('00:01');
    expect(formatRemainingTime(FOCUS_DURATION_MS)).toBe('25:00');
  });

  it('uses only the supplied monotonic time to reconcile elapsed duration', () => {
    const runningTimer = startTimer(createFocusTimer(60_000), STARTED_AT);
    const timerWithCivilClockAtStart = Date.now();

    jest.useFakeTimers().setSystemTime(timerWithCivilClockAtStart + 60 * 60 * 1_000);
    try {
      expect(reconcileTimer(runningTimer, STARTED_AT + 15_000).remainingMs).toBe(45_000);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('Pomodoro phase transitions', () => {
  it('prepares a paused short break only after focus reaches zero', () => {
    const focusTimer = startTimer(createFocusTimer(1_000), STARTED_AT);
    const cycle = startPomodoroCycle(createPomodoroCycle());

    expect(completeFocusPhase(focusTimer, cycle)).toBeNull();

    const finishedFocus = reconcileTimer(focusTimer, STARTED_AT + 1_000);
    const result = completeFocusPhase(finishedFocus, cycle);

    expect(result).toMatchObject({
      cycle: { pomodoroCount: 1, activeCycleLength: DEFAULT_POMODORO_CYCLE_LENGTH },
      breakType: 'short',
      breakTimer: {
        phase: 'break',
        status: 'paused',
        initialDurationMs: DEFAULT_SHORT_BREAK_MINUTES * 60_000,
        remainingMs: DEFAULT_SHORT_BREAK_MINUTES * 60_000,
        startedAt: null,
      },
    });
  });

  it('does not count a paused or reset focus attempt', () => {
    const focusTimer = startTimer(createFocusTimer(1_000), STARTED_AT);
    const cycle = startPomodoroCycle(createPomodoroCycle());
    const paused = pauseTimer(focusTimer, STARTED_AT + 500);
    const reset = resetTimer(paused);

    expect(completeFocusPhase(paused, cycle)).toBeNull();
    expect(completeFocusPhase(reset, cycle)).toBeNull();
    expect(cycle.pomodoroCount).toBe(0);
  });

  it('prepares a long break and resets progress at the active cycle goal', () => {
    const cycle = startPomodoroCycle(
      createPomodoroCycle(DEFAULT_POMODORO_CYCLE_LENGTH - 1),
    );
    const finishedFocus = reconcileTimer(
      startTimer(createFocusTimer(1_000), STARTED_AT),
      STARTED_AT + 1_000,
    );
    const result = completeFocusPhase(finishedFocus, cycle);

    expect(result).toMatchObject({
      cycle: { pomodoroCount: 0 },
      breakType: 'long',
      breakTimer: {
        status: 'paused',
        initialDurationMs: DEFAULT_LONG_BREAK_MINUTES * 60_000,
        remainingMs: DEFAULT_LONG_BREAK_MINUTES * 60_000,
      },
    });
  });

  it('starts the prepared phase from its current remaining time', () => {
    const pausedBreak = pauseTimer(
      startTimer(createPreparedBreakTimer(10), STARTED_AT),
      STARTED_AT + 60_000,
    );

    expect(startTimer(pausedBreak, STARTED_AT + 120_000)).toEqual({
      ...pausedBreak,
      status: 'running',
      startedAt: STARTED_AT + 120_000,
    });
  });

  it('prepares focus after a break with the current study duration', () => {
    const finishedFocus = { ...createFocusTimer(25 * 60_000), status: 'finished' as const, remainingMs: 0 };

    expect(prepareFocusAfterBreak(finishedFocus, 40 * 60_000)).toEqual(createFocusTimer(40 * 60_000));
  });

  it('prepares focus paused after a break and waits for an explicit start', () => {
    const focusTimer = createFocusTimer(30 * 60_000);
    const preparedFocus = prepareFocusAfterBreak(focusTimer, 30 * 60_000);

    expect(preparedFocus).toEqual(focusTimer);
    expect(startTimer(preparedFocus, STARTED_AT)).toEqual({
      ...preparedFocus,
      status: 'running',
      startedAt: STARTED_AT,
    });
  });

  it('keeps the active cycle goal stable and applies the configured goal after a long break', () => {
    const cycle = startPomodoroCycle(createPomodoroCycle());
    const reconfigured = configurePomodoroCycle(cycle, 3);

    expect(reconfigured).toMatchObject({
      pomodoroCount: 0,
      activeCycleLength: DEFAULT_POMODORO_CYCLE_LENGTH,
      configuredCycleLength: 3,
      hasStarted: true,
    });

    expect(completePomodoroBreak(reconfigured, 'long')).toMatchObject({
      pomodoroCount: 0,
      activeCycleLength: 3,
      configuredCycleLength: 3,
      hasStarted: false,
    });
  });

  it('uses a new configured goal immediately before a cycle starts', () => {
    expect(configurePomodoroCycle(createPomodoroCycle(), 3)).toMatchObject({
      activeCycleLength: 3,
      configuredCycleLength: 3,
      hasStarted: false,
    });
  });

  it('uses the active goal for progress and break selection while a new goal is deferred', () => {
    const cycle = configurePomodoroCycle(
      startPomodoroCycle(createPomodoroCycle(2)),
      3,
    );
    const finishedFocus = reconcileTimer(
      startTimer(createFocusTimer(1_000), STARTED_AT),
      STARTED_AT + 1_000,
    );
    const result = completeFocusPhase(finishedFocus, cycle);

    expect(result).toMatchObject({
      cycle: {
        pomodoroCount: 3,
        activeCycleLength: DEFAULT_POMODORO_CYCLE_LENGTH,
        configuredCycleLength: 3,
      },
      breakType: 'short',
    });
  });

  it('rejects a non-positive configured cycle goal', () => {
    expect(() => configurePomodoroCycle(createPomodoroCycle(), 0)).toThrow(
      'Pomodoro cycle length must be a positive integer.',
    );
  });

  it('does not count the same finished timer twice from the same cycle state', () => {
    const cycle = startPomodoroCycle(createPomodoroCycle());
    const finishedFocus = reconcileTimer(
      startTimer(createFocusTimer(1_000), STARTED_AT),
      STARTED_AT + 1_000,
    );

    expect(completeFocusPhase(finishedFocus, cycle)).toEqual(
      completeFocusPhase(finishedFocus, cycle),
    );
  });
});

describe('stopping a phase', () => {
  const MINUTE = 60_000;

  it('prepares a paused short break without counting a pomodoro when a running study is stopped', () => {
    const cycle = startPomodoroCycle(createPomodoroCycle(3, 4));
    const running = startTimer(createFocusTimer(25 * MINUTE), STARTED_AT);
    const now = STARTED_AT + 5 * MINUTE;

    expect(stopFocusPhase(running, cycle, 7, now)).toEqual({
      focusTimer: { ...running, status: 'finished', remainingMs: 0, startedAt: null },
      breakTimer: createPreparedBreakTimer(7),
      breakType: 'short',
      cycle,
    });
  });

  it('also stops a study paused after it started', () => {
    const paused = pauseTimer(startTimer(createFocusTimer(25 * MINUTE), STARTED_AT), STARTED_AT + MINUTE);
    const result = stopFocusPhase(paused, createPomodoroCycle(), 5, STARTED_AT + 2 * MINUTE);

    expect(result?.breakTimer.status).toBe('paused');
    expect(result?.breakType).toBe('short');
  });

  it('does not stop a prepared study', () => {
    expect(stopFocusPhase(createFocusTimer(), createPomodoroCycle(), 5, STARTED_AT)).toBeNull();
  });

  it('does not stop a study whose time already ran out', () => {
    const running = startTimer(createFocusTimer(MINUTE), STARTED_AT);
    expect(stopFocusPhase(running, createPomodoroCycle(), 5, STARTED_AT + MINUTE)).toBeNull();
  });

  it('returns to a new paused study and keeps the cycle after a short break', () => {
    const cycle = startPomodoroCycle(createPomodoroCycle(2, 4));

    expect(stopBreakPhase(cycle, 'short', 30 * MINUTE)).toEqual({
      focusTimer: createFocusTimer(30 * MINUTE),
      breakTimer: createBreakTimer(),
      cycle,
    });
  });

  it('finishes the cycle with the configured goal when a long break is stopped', () => {
    const cycle = { ...startPomodoroCycle(createPomodoroCycle(0, 4)), configuredCycleLength: 6 };
    const result = stopBreakPhase(cycle, 'long', 25 * MINUTE);

    expect(result.cycle).toEqual({
      pomodoroCount: 0,
      activeCycleLength: 6,
      configuredCycleLength: 6,
      hasStarted: false,
    });
  });
});
