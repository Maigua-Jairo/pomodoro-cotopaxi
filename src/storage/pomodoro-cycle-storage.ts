import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_POMODORO_CYCLE_LENGTH, isValidPomodoroCycleLength } from '@/domain/timer';

export const POMODORO_COUNT_STORAGE_KEY = 'pomodoro-cotopaxi:cycle-count';
export const ACTIVE_CYCLE_LENGTH_STORAGE_KEY = 'pomodoro-cotopaxi:active-cycle-length';

export interface StoredPomodoroCycle {
  pomodoroCount: number;
  cycleLength: number;
}

function parseStoredInteger(value: string | null, fieldName: string, defaultValue: number): number {
  if (value === null) {
    return defaultValue;
  }

  if (!/^(0|[1-9]\d*)$/.test(value)) {
    throw new TypeError(`Stored ${fieldName} must be a non-negative integer.`);
  }

  const parsedValue = Number(value);
  if (!Number.isSafeInteger(parsedValue)) {
    throw new RangeError(`Stored ${fieldName} exceeds the supported integer range.`);
  }

  return parsedValue;
}

export async function loadPomodoroCycle(): Promise<StoredPomodoroCycle> {
  const [storedCount, storedCycleLength] = await Promise.all([
    AsyncStorage.getItem(POMODORO_COUNT_STORAGE_KEY),
    AsyncStorage.getItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY),
  ]);
  const pomodoroCount = parseStoredInteger(storedCount, 'Pomodoro count', 0);
  const cycleLength = parseStoredInteger(
    storedCycleLength,
    'active cycle length',
    DEFAULT_POMODORO_CYCLE_LENGTH,
  );

  if (!isValidPomodoroCycleLength(cycleLength)) {
    throw new RangeError('Stored active cycle length must be a positive integer.');
  }

  if (pomodoroCount >= cycleLength) {
    throw new RangeError('Stored Pomodoro count must be below the active cycle length.');
  }

  return { pomodoroCount, cycleLength };
}

export async function savePomodoroCycle(cycle: StoredPomodoroCycle): Promise<void> {
  if (
    !Number.isInteger(cycle.pomodoroCount) ||
    cycle.pomodoroCount < 0 ||
    !isValidPomodoroCycleLength(cycle.cycleLength) ||
    cycle.pomodoroCount >= cycle.cycleLength
  ) {
    throw new RangeError('Pomodoro cycle data is invalid.');
  }

  await Promise.all([
    AsyncStorage.setItem(POMODORO_COUNT_STORAGE_KEY, String(cycle.pomodoroCount)),
    AsyncStorage.setItem(ACTIVE_CYCLE_LENGTH_STORAGE_KEY, String(cycle.cycleLength)),
  ]);
}
