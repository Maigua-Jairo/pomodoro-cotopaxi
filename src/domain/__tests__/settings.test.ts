import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_SETTINGS,
  SETTINGS_RANGES,
  applySettingsToSession,
  hasDeferredDurationChange,
  isValidSettings,
  validateSettingsInput,
  type PomodoroSettings,
  type SettingsField,
  type SettingsInput,
} from '../settings';
import {
  completeFocusPhase,
  completePomodoroBreak,
  createBreakTimer,
  createFocusTimer,
  createPomodoroCycle,
  createPreparedBreakTimer,
  pauseTimer,
  startPomodoroCycle,
  startTimer,
  type PomodoroCycleState,
  type TimerState,
} from '../timer';

const MINUTE_MS = 60 * 1_000;

const VALID_INPUT: SettingsInput = {
  focusMinutes: '25',
  shortBreakMinutes: '5',
  longBreakMinutes: '15',
  cycleLength: '4',
};

function settings(overrides: Partial<PomodoroSettings> = {}): PomodoroSettings {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

function finishFocus(timer: TimerState): TimerState {
  return { ...timer, status: 'finished', remainingMs: 0, startedAt: null };
}

function startedCycle(pomodoroCount: number, cycleLength: number): PomodoroCycleState {
  return startPomodoroCycle(createPomodoroCycle(pomodoroCount, cycleLength));
}

describe('settings defaults and ranges', () => {
  it('uses 25/5/15/4 as default settings', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cycleLength: 4,
    });
  });

  it('defines the allowed ranges for every field', () => {
    expect(SETTINGS_RANGES).toEqual({
      focusMinutes: { min: 1, max: 120 },
      shortBreakMinutes: { min: 1, max: 30 },
      longBreakMinutes: { min: 1, max: 60 },
      cycleLength: { min: 4, max: 8 },
    });
  });

  it('recognizes only complete settings within range', () => {
    expect(isValidSettings(DEFAULT_SETTINGS)).toBe(true);
    expect(isValidSettings({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 })).toBe(
      false,
    );
    expect(isValidSettings(settings({ cycleLength: 9 }))).toBe(false);
    expect(isValidSettings(settings({ focusMinutes: 2.5 }))).toBe(false);
    expect(isValidSettings(null)).toBe(false);
  });
});

describe('validateSettingsInput', () => {
  it('accepts the limits of every range', () => {
    expect(
      validateSettingsInput({
        focusMinutes: '1',
        shortBreakMinutes: '1',
        longBreakMinutes: '1',
        cycleLength: '4',
      }),
    ).toEqual({
      success: true,
      settings: { focusMinutes: 1, shortBreakMinutes: 1, longBreakMinutes: 1, cycleLength: 4 },
    });
    expect(
      validateSettingsInput({
        focusMinutes: '120',
        shortBreakMinutes: '30',
        longBreakMinutes: '60',
        cycleLength: '8',
      }),
    ).toEqual({
      success: true,
      settings: { focusMinutes: 120, shortBreakMinutes: 30, longBreakMinutes: 60, cycleLength: 8 },
    });
  });

  it.each<[SettingsField, string, string]>([
    ['focusMinutes', '', 'Ingresa un número entero entre 1 y 120.'],
    ['focusMinutes', '0', 'Ingresa un número entero entre 1 y 120.'],
    ['focusMinutes', '-5', 'Ingresa un número entero entre 1 y 120.'],
    ['focusMinutes', '2.5', 'Ingresa un número entero entre 1 y 120.'],
    ['focusMinutes', '121', 'Ingresa un número entero entre 1 y 120.'],
    ['shortBreakMinutes', '31', 'Ingresa un número entero entre 1 y 30.'],
    ['longBreakMinutes', '61', 'Ingresa un número entero entre 1 y 60.'],
    ['cycleLength', '3', 'Ingresa un número entero entre 4 y 8.'],
    ['cycleLength', '9', 'Ingresa un número entero entre 4 y 8.'],
  ])('rejects %s = "%s" with its range', (field, value, message) => {
    expect(validateSettingsInput({ ...VALID_INPUT, [field]: value })).toEqual({
      success: false,
      errors: { [field]: message },
    });
  });

  it('reports every invalid field and returns no settings', () => {
    const result = validateSettingsInput({ ...VALID_INPUT, focusMinutes: '0', cycleLength: '' });

    expect(result).toEqual({
      success: false,
      errors: {
        focusMinutes: 'Ingresa un número entero entre 1 y 120.',
        cycleLength: 'Ingresa un número entero entre 4 y 8.',
      },
    });
    expect('settings' in result).toBe(false);
  });

  it('ignores surrounding spaces', () => {
    expect(validateSettingsInput({ ...VALID_INPUT, focusMinutes: ' 30 ' })).toEqual({
      success: true,
      settings: settings({ focusMinutes: 30 }),
    });
  });
});

describe('applySettingsToSession', () => {
  const idleSession = {
    focusTimer: createFocusTimer(),
    breakTimer: createBreakTimer(),
    breakType: null,
    cycle: createPomodoroCycle(),
  };

  it('updates a prepared focus phase immediately', () => {
    const result = applySettingsToSession(idleSession, settings({ focusMinutes: 40 }));

    expect(result.focusTimer).toEqual(createFocusTimer(40 * MINUTE_MS));
  });

  it('keeps the original duration of a running focus phase', () => {
    const running = startTimer(createFocusTimer(), 0);
    const result = applySettingsToSession(
      { ...idleSession, focusTimer: running, cycle: startPomodoroCycle(idleSession.cycle) },
      settings({ focusMinutes: 40 }),
    );

    expect(result.focusTimer).toBe(running);
  });

  it('keeps the original duration of a focus phase paused after starting', () => {
    const paused = pauseTimer(startTimer(createFocusTimer(), 0), 60_000);
    const result = applySettingsToSession(
      { ...idleSession, focusTimer: paused, cycle: startPomodoroCycle(idleSession.cycle) },
      settings({ focusMinutes: 40 }),
    );

    expect(result.focusTimer).toBe(paused);
  });

  it.each<['short' | 'long', number]>([
    ['short', 12],
    ['long', 45],
  ])('updates a prepared %s break with its own setting', (breakType, minutes) => {
    const result = applySettingsToSession(
      {
        ...idleSession,
        focusTimer: finishFocus(createFocusTimer()),
        breakTimer: createPreparedBreakTimer(5),
        breakType,
      },
      settings({ shortBreakMinutes: 12, longBreakMinutes: 45 }),
    );

    expect(result.breakTimer).toEqual(createPreparedBreakTimer(minutes));
  });

  it('keeps a started break unchanged', () => {
    const running = startTimer(createPreparedBreakTimer(5), 0);
    const result = applySettingsToSession(
      {
        ...idleSession,
        focusTimer: finishFocus(createFocusTimer()),
        breakTimer: running,
        breakType: 'short',
      },
      settings({ shortBreakMinutes: 12 }),
    );

    expect(result.breakTimer).toBe(running);
  });

  it('applies a new cycle goal immediately before the cycle starts', () => {
    const result = applySettingsToSession(idleSession, settings({ cycleLength: 6 }));

    expect(result.cycle.activeCycleLength).toBe(6);
    expect(result.cycle.configuredCycleLength).toBe(6);
    expect(result.cycleGoalReached).toBe(false);
  });

  it('keeps the active goal when the new goal is above the completed pomodoros', () => {
    const result = applySettingsToSession(
      { ...idleSession, cycle: startedCycle(2, 8) },
      settings({ cycleLength: 5 }),
    );

    expect(result.cycle.activeCycleLength).toBe(8);
    expect(result.cycle.configuredCycleLength).toBe(5);
    expect(result.cycleGoalReached).toBe(false);

    const afterLongBreak = completePomodoroBreak(result.cycle, 'long');
    expect(afterLongBreak.activeCycleLength).toBe(5);
  });

  it('forces the long break after the next study when the goal drops below the completed pomodoros', () => {
    const result = applySettingsToSession(
      { ...idleSession, cycle: startedCycle(6, 8) },
      settings({ cycleLength: 5 }),
    );

    expect(result.cycleGoalReached).toBe(false);
    const completion = completeFocusPhase(finishFocus(createFocusTimer()), result.cycle);
    expect(completion?.breakType).toBe('long');
    expect(completion?.cycle.pomodoroCount).toBe(0);
    expect(completePomodoroBreak(completion!.cycle, 'long').activeCycleLength).toBe(5);
  });

  it('flags a reached goal and forces the long break when the goal equals the completed pomodoros', () => {
    const result = applySettingsToSession(
      {
        ...idleSession,
        focusTimer: finishFocus(createFocusTimer()),
        breakTimer: createPreparedBreakTimer(5),
        breakType: 'short',
        cycle: startedCycle(5, 8),
      },
      settings({ cycleLength: 5 }),
    );

    expect(result.cycleGoalReached).toBe(true);
    const completion = completeFocusPhase(finishFocus(createFocusTimer()), result.cycle);
    expect(completion?.breakType).toBe('long');
  });

  it('uses the current settings for the break prepared after a study', () => {
    const result = applySettingsToSession(idleSession, settings({ shortBreakMinutes: 7 }));
    const completion = completeFocusPhase(
      finishFocus(result.focusTimer),
      result.cycle,
      7,
      DEFAULT_SETTINGS.longBreakMinutes,
    );

    expect(completion?.breakTimer.initialDurationMs).toBe(7 * MINUTE_MS);
  });
});

describe('hasDeferredDurationChange', () => {
  const preparedSession = {
    focusTimer: createFocusTimer(),
    breakTimer: createBreakTimer(),
    breakType: null,
    cycle: createPomodoroCycle(),
  };
  const runningFocusSession = {
    ...preparedSession,
    focusTimer: startTimer(createFocusTimer(), 0),
    cycle: startPomodoroCycle(createPomodoroCycle()),
  };
  const startedBreakSession = {
    ...preparedSession,
    focusTimer: finishFocus(createFocusTimer()),
    breakTimer: pauseTimer(startTimer(createPreparedBreakTimer(5), 0), 60_000),
    breakType: 'short' as const,
  };

  it('detects a new duration for a started study phase', () => {
    expect(
      hasDeferredDurationChange(runningFocusSession, DEFAULT_SETTINGS, settings({ focusMinutes: 40 })),
    ).toBe(true);
  });

  it('ignores changes that do not affect the started phase', () => {
    expect(
      hasDeferredDurationChange(
        runningFocusSession,
        DEFAULT_SETTINGS,
        settings({ shortBreakMinutes: 10, cycleLength: 6 }),
      ),
    ).toBe(false);
  });

  it('ignores a prepared phase, which takes the new duration immediately', () => {
    expect(
      hasDeferredDurationChange(preparedSession, DEFAULT_SETTINGS, settings({ focusMinutes: 40 })),
    ).toBe(false);
  });

  it('detects a new duration for a started break of the same type only', () => {
    expect(
      hasDeferredDurationChange(
        startedBreakSession,
        DEFAULT_SETTINGS,
        settings({ shortBreakMinutes: 10 }),
      ),
    ).toBe(true);
    expect(
      hasDeferredDurationChange(
        startedBreakSession,
        DEFAULT_SETTINGS,
        settings({ longBreakMinutes: 30 }),
      ),
    ).toBe(false);
  });
});
