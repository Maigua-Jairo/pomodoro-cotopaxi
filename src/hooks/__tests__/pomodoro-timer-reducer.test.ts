import { describe, expect, it, jest } from '@jest/globals';

import {
  STORAGE_SAVE_FAILED_MESSAGE,
  createInitialState,
  pomodoroTimerReducer,
} from '../use-pomodoro-timer';

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
