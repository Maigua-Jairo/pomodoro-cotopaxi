import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS } from '@/domain/settings';
import {
  POMODORO_SETTINGS_STORAGE_KEY,
  loadPomodoroSettings,
  savePomodoroSettings,
} from '../pomodoro-settings-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const CUSTOM_SETTINGS = {
  focusMinutes: 50,
  shortBreakMinutes: 10,
  longBreakMinutes: 30,
  cycleLength: 6,
};

describe('Pomodoro settings storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('returns the default settings when nothing was saved', async () => {
    await expect(loadPomodoroSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('restores the saved settings', async () => {
    await savePomodoroSettings(CUSTOM_SETTINGS);

    await expect(loadPomodoroSettings()).resolves.toEqual(CUSTOM_SETTINGS);
    expect(JSON.parse((await AsyncStorage.getItem(POMODORO_SETTINGS_STORAGE_KEY))!)).toEqual({
      version: 1,
      ...CUSTOM_SETTINGS,
    });
  });

  it.each([
    ['broken JSON', '{focus'],
    ['an unknown version', JSON.stringify({ version: 2, ...CUSTOM_SETTINGS })],
    ['out-of-range values', JSON.stringify({ version: 1, ...CUSTOM_SETTINGS, cycleLength: 12 })],
    ['missing fields', JSON.stringify({ version: 1, focusMinutes: 25 })],
  ])('rejects %s without modifying the stored value', async (_label, storedValue) => {
    await AsyncStorage.setItem(POMODORO_SETTINGS_STORAGE_KEY, storedValue);
    jest.clearAllMocks();
    const setItem = jest.spyOn(AsyncStorage, 'setItem');
    const removeItem = jest.spyOn(AsyncStorage, 'removeItem');

    await expect(loadPomodoroSettings()).rejects.toThrow();
    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    await expect(AsyncStorage.getItem(POMODORO_SETTINGS_STORAGE_KEY)).resolves.toBe(storedValue);
  });

  it('refuses to save invalid settings', async () => {
    await expect(
      savePomodoroSettings({ ...CUSTOM_SETTINGS, focusMinutes: 0 }),
    ).rejects.toThrow(RangeError);
    await expect(AsyncStorage.getItem(POMODORO_SETTINGS_STORAGE_KEY)).resolves.toBeNull();
  });
});
