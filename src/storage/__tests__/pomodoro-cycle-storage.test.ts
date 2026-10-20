import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ACTIVE_CYCLE_LENGTH_STORAGE_KEY,
  POMODORO_COUNT_STORAGE_KEY,
  loadPomodoroCycle,
  savePomodoroCycle,
} from '../pomodoro-cycle-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('Pomodoro cycle storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('restores the legacy counter and defaults the missing active goal', async () => {
    await AsyncStorage.setItem(POMODORO_COUNT_STORAGE_KEY, '2');

    await expect(loadPomodoroCycle()).resolves.toEqual({
      pomodoroCount: 2,
      cycleLength: 4,
    });
  });

  it('stores and restores the counter as text and the active goal separately', async () => {
    await savePomodoroCycle({ pomodoroCount: 2, cycleLength: 5 });

    expect(await AsyncStorage.getItem(POMODORO_COUNT_STORAGE_KEY)).toBe('2');
    expect(await AsyncStorage.getItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY)).toBe('5');
    await expect(loadPomodoroCycle()).resolves.toEqual({
      pomodoroCount: 2,
      cycleLength: 5,
    });
  });

  it.each([
    ['counter', POMODORO_COUNT_STORAGE_KEY, '-1'],
    ['counter', POMODORO_COUNT_STORAGE_KEY, '1.5'],
    ['goal', ACTIVE_CYCLE_LENGTH_STORAGE_KEY, '0'],
    ['goal', ACTIVE_CYCLE_LENGTH_STORAGE_KEY, 'not-a-number'],
  ])('reports an invalid saved %s value', async (_field, key, value) => {
    await AsyncStorage.setItem(key, value);

    await expect(loadPomodoroCycle()).rejects.toThrow();
  });

  it('reports a counter that exceeds the saved active goal', async () => {
    await AsyncStorage.setItem(POMODORO_COUNT_STORAGE_KEY, '3');
    await AsyncStorage.setItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY, '3');

    await expect(loadPomodoroCycle()).rejects.toThrow();
  });

  it('propagates storage read failures', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('read failed'));

    await expect(loadPomodoroCycle()).rejects.toThrow('read failed');
  });

  it('propagates storage write failures', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write failed'));

    await expect(savePomodoroCycle({ pomodoroCount: 0, cycleLength: 4 })).rejects.toThrow(
      'write failed',
    );
  });
});
