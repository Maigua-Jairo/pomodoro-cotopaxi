import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, isValidSettings, type PomodoroSettings } from '@/domain/settings';

export const POMODORO_SETTINGS_STORAGE_KEY = 'pomodoro-cotopaxi:settings:v1';
const POMODORO_SETTINGS_VERSION = 1;

export async function loadPomodoroSettings(): Promise<PomodoroSettings> {
  const storedValue = await AsyncStorage.getItem(POMODORO_SETTINGS_STORAGE_KEY);
  if (storedValue === null) {
    return DEFAULT_SETTINGS;
  }

  const parsedValue: unknown = JSON.parse(storedValue);
  if (
    typeof parsedValue !== 'object' ||
    parsedValue === null ||
    (parsedValue as { version?: unknown }).version !== POMODORO_SETTINGS_VERSION
  ) {
    throw new TypeError('Unsupported Pomodoro settings version.');
  }

  if (!isValidSettings(parsedValue)) {
    throw new TypeError('Stored Pomodoro settings are invalid.');
  }

  const { focusMinutes, shortBreakMinutes, longBreakMinutes, cycleLength } = parsedValue;
  return { focusMinutes, shortBreakMinutes, longBreakMinutes, cycleLength };
}

export async function savePomodoroSettings(settings: PomodoroSettings): Promise<void> {
  if (!isValidSettings(settings)) {
    throw new RangeError('Pomodoro settings are invalid.');
  }

  await AsyncStorage.setItem(
    POMODORO_SETTINGS_STORAGE_KEY,
    JSON.stringify({ version: POMODORO_SETTINGS_VERSION, ...settings }),
  );
}
