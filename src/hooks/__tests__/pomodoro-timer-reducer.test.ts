import { describe, expect, it, jest } from '@jest/globals';

import {
  STORAGE_SAVE_FAILED_MESSAGE,
  createInitialState,
  pomodoroTimerReducer,
} from '../use-pomodoro-timer';
import {
  createPreparedBreakTimer,
  startPomodoroCycle,
  startTimer,
} from '@/domain/timer';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-notifications', () => ({}));
jest.mock('expo-device', () => ({ isDevice: true }));

describe('storage save failure notice', () => {
  it('shows the notice without touching the timers', () => {
    const initial = createInitialState();
    const next = pomodoroTimerReducer(initial, { type: 'storage-save-failed' });

    expect(next.storageMessage).toBe(STORAGE_SAVE_FAILED_MESSAGE);
    expect(STORAGE_SAVE_FAILED_MESSAGE).toBe(
      'No se pudo guardar tu progreso en el celular. El temporizador sigue funcionando.',
    );
    expect(next.focusTimer).toBe(initial.focusTimer);
    expect(next.breakTimer).toBe(initial.breakTimer);
    expect(next.cycle).toBe(initial.cycle);
  });

  it('hides the notice when the student closes it and shows it again on a new failure', () => {
    const failed = pomodoroTimerReducer(createInitialState(), { type: 'storage-save-failed' });
    const dismissed = pomodoroTimerReducer(failed, { type: 'dismiss-storage-message' });

    expect(dismissed.storageMessage).toBeNull();
    expect(
      pomodoroTimerReducer(dismissed, { type: 'storage-save-failed' }).storageMessage,
    ).toBe(STORAGE_SAVE_FAILED_MESSAGE);
  });
});

describe('stopping a phase', () => {
  const MINUTE = 60_000;
  const hydrated = { ...createInitialState(), isHydrated: true };
  const studying = {
    ...hydrated,
    focusTimer: startTimer(hydrated.focusTimer, 0),
    cycle: startPomodoroCycle(hydrated.cycle),
    expiresAtEpochMs: 1_000_000,
    notificationId: 'focus-notification',
  };

  it('prepares a paused short break without the alarm and cancels the study notice', () => {
    const next = pomodoroTimerReducer(studying, {
      type: 'stop-focus',
      now: 5 * MINUTE
    });

    expect(next.breakType).toBe('short');
    expect(next.breakTimer).toEqual(createPreparedBreakTimer(5));
    expect(next.focusTimer.status).toBe('finished');
    expect(next.cycle.pomodoroCount).toBe(0);
    expect(next.expiresAtEpochMs).toBeNull();
    expect(next.notificationId).toBeNull();
    expect(next.isAlarmActive).toBe(false);
    expect(next.canPersistSession).toBe(true);
  });

  it('does nothing when the study already ran out while the dialog was open', () => {
    expect(
      pomodoroTimerReducer(studying, { type: 'stop-focus', now: 25 * MINUTE }),
    ).toBe(studying);
  });

  it('does nothing for a study that was not started', () => {
    expect(pomodoroTimerReducer(hydrated, { type: 'stop-focus', now: 0 })).toBe(
      hydrated,
    );
  });

  it('returns to a prepared study without the alarm when a break is stopped', () => {
    const onBreak = pomodoroTimerReducer(
      pomodoroTimerReducer(studying, { type: 'stop-focus', now: 5 * MINUTE }),
      { type: 'start-break', now: 5 * MINUTE, expiresAtEpochMs: 2_000_000 },
    );
    const next = pomodoroTimerReducer(onBreak, { type: 'stop-break', now: 6 * MINUTE });

    expect(next.breakType).toBeNull();
    expect(next.focusTimer).toEqual(createInitialState().focusTimer);
    expect(next.breakTimer.initialDurationMs).toBe(0);
    expect(next.expiresAtEpochMs).toBeNull();
    expect(next.notificationId).toBeNull();
    expect(next.isAlarmActive).toBe(false);
  });

  it('does nothing when the break already ran out', () => {
    const onBreak = pomodoroTimerReducer(
      pomodoroTimerReducer(studying, { type: 'stop-focus', now: 5 * MINUTE }),
      { type: 'start-break', now: 5 * MINUTE, expiresAtEpochMs: 2_000_000 },
    );
    expect(pomodoroTimerReducer(onBreak, { type: 'stop-break', now: 10 * MINUTE })).toBe(onBreak);
  });
});

describe('notification permission granted after starting', () => {
  it('clears the unavailable notice and asks to schedule the notice again', () => {
    const unavailable = pomodoroTimerReducer(
      { ...createInitialState(), isHydrated: true },
      { type: 'notification-unavailable', expiresAtEpochMs: null, message: 'Desactivadas' },
    );
    const next = pomodoroTimerReducer(unavailable, { type: 'notification-permission-granted' });

    expect(next.notificationMessage).toBeNull();
    expect(next.notificationStatus).toBe('idle');
    expect(next.permissionVersion).toBe(unavailable.permissionVersion + 1);
  });

  it('keeps a scheduling failure message visible', () => {
    const failed = pomodoroTimerReducer(
      { ...createInitialState(), isHydrated: true },
      { type: 'notification-failed', expiresAtEpochMs: null, message: 'Fallo' },
    );

    expect(
      pomodoroTimerReducer(failed, { type: 'notification-permission-granted' }).notificationMessage,
    ).toBe('Fallo');
  });
});
