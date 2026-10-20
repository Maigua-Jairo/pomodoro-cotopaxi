import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createBreakTimer,
  createFocusTimer,
  createPomodoroCycle,
  createPreparedBreakTimer,
  startTimer,
} from '@/domain/timer';
import { ACTIVE_CYCLE_LENGTH_STORAGE_KEY, POMODORO_COUNT_STORAGE_KEY } from '../pomodoro-cycle-storage';
import {
  POMODORO_SESSION_STORAGE_KEY,
  loadPomodoroSession,
  savePomodoroSession,
  type PomodoroSessionSnapshot,
} from '../pomodoro-session-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const session: PomodoroSessionSnapshot = {
  version: 1,
  focusTimer: createFocusTimer(),
  breakTimer: createBreakTimer(),
  cycle: createPomodoroCycle(),
  breakType: null,
  hasStartedSession: false,
  expiresAtEpochMs: null,
  notificationId: null,
};

describe('Pomodoro session storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('returns null when no session snapshot has been saved', async () => {
    await expect(loadPomodoroSession()).resolves.toBeNull();
  });

  it('round-trips a versioned session snapshot', async () => {
    const runningSession: PomodoroSessionSnapshot = {
      ...session,
      focusTimer: startTimer(session.focusTimer, 100),
      expiresAtEpochMs: 25 * 60_000 + Date.now(),
      notificationId: 'notification-1',
    };

    await savePomodoroSession(runningSession);

    expect(await AsyncStorage.getItem(POMODORO_SESSION_STORAGE_KEY)).toBe(
      JSON.stringify(runningSession),
    );
    await expect(loadPomodoroSession()).resolves.toEqual(runningSession);
  });

  it('rejects malformed and unsupported snapshots instead of treating them as a new session', async () => {
    await AsyncStorage.setItem(POMODORO_SESSION_STORAGE_KEY, '{');
    await expect(loadPomodoroSession()).rejects.toThrow();

    await AsyncStorage.setItem(
      POMODORO_SESSION_STORAGE_KEY,
      JSON.stringify({ ...session, version: 2 }),
    );
    await expect(loadPomodoroSession()).rejects.toThrow('Unsupported Pomodoro session version.');

    await AsyncStorage.setItem(
      POMODORO_SESSION_STORAGE_KEY,
      JSON.stringify({ ...session, breakType: 'medium' }),
    );
    await expect(loadPomodoroSession()).rejects.toThrow('Stored Pomodoro session is invalid.');
  });

  it('rejects a running timer without a saved expiry', async () => {
    await expect(
      savePomodoroSession({
        ...session,
        focusTimer: startTimer(session.focusTimer, 100),
      }),
    ).rejects.toThrow('A running session must have an expiry timestamp.');
  });

  it('rejects a running break without a prepared break phase', async () => {
    await expect(
      savePomodoroSession({
        ...session,
        breakTimer: startTimer(createPreparedBreakTimer(), 100),
        expiresAtEpochMs: Date.now() + 60_000,
      }),
    ).rejects.toThrow('Pomodoro session is invalid.');
  });

  it('propagates storage read failures', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('read failed'));

    await expect(loadPomodoroSession()).rejects.toThrow('read failed');
  });

  it('propagates storage write failures', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write failed'));

    await expect(savePomodoroSession(session)).rejects.toThrow('write failed');
  });

  it('keeps the existing cycle storage keys and values untouched', async () => {
    await AsyncStorage.setItem(POMODORO_COUNT_STORAGE_KEY, '2');
    await AsyncStorage.setItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY, '5');

    await savePomodoroSession(session);

    await expect(AsyncStorage.getItem(POMODORO_COUNT_STORAGE_KEY)).resolves.toBe('2');
    await expect(AsyncStorage.getItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY)).resolves.toBe('5');
  });
});
