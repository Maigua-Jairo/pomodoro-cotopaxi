import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Vibration } from 'react-native';

import {
  ALARM_AUTO_STOP_MS,
  startPomodoroAlarm,
  stopPomodoroAlarm,
} from '../pomodoro-alarm';

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
  setAudioModeAsync: jest.fn(),
}));

const playMock = jest.fn<() => void>();
const removeMock = jest.fn<() => void>();
const pauseMock = jest.fn<() => void>();
const player: ReturnType<typeof createAudioPlayer> = Object.assign(Object.create(null), {
  loop: false,
  play: playMock,
  pause: pauseMock,
  remove: removeMock,
});

describe('Pomodoro alarm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(setAudioModeAsync).mockResolvedValue(undefined);
    playMock.mockImplementation(() => {});
    jest.mocked(createAudioPlayer).mockReturnValue(player);
    jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
    jest.spyOn(Vibration, 'cancel').mockImplementation(() => {});
  });

  it('starts looping sound and vibration', async () => {
    await startPomodoroAlarm();

    expect(setAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    expect(createAudioPlayer).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ updateInterval: expect.any(Number) }),
    );
    expect(player.loop).toBe(true);
    expect(playMock).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalled();

    stopPomodoroAlarm();
  });

  it('stops playback and vibration idempotently', async () => {
    await startPomodoroAlarm();

    stopPomodoroAlarm();
    stopPomodoroAlarm();

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(Vibration.cancel).toHaveBeenCalledTimes(1);
  });

  it('cleans up both effects and propagates playback errors', async () => {
    const error = new Error('play failed');
    playMock.mockImplementation(() => {
      throw error;
    });

    await expect(startPomodoroAlarm()).rejects.toBe(error);

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(Vibration.cancel).toHaveBeenCalled();
  });

  it('stops automatically after 3 seconds without interaction', () => {
    expect(ALARM_AUTO_STOP_MS).toBe(3_000);
  });

  it('pauses and disables looping before releasing the player', async () => {
    await startPomodoroAlarm();

    stopPomodoroAlarm();

    expect(player.loop).toBe(false);
    expect(pauseMock).toHaveBeenCalledTimes(1);
    expect(pauseMock.mock.invocationCallOrder[0]).toBeLessThan(
      removeMock.mock.invocationCallOrder[0],
    );
  });

  it('stops itself after the auto-stop time even if nobody stops it', async () => {
    jest.useFakeTimers();
    try {
      await startPomodoroAlarm();
      jest.advanceTimersByTime(ALARM_AUTO_STOP_MS - 1);
      expect(removeMock).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(pauseMock).toHaveBeenCalledTimes(1);
      expect(removeMock).toHaveBeenCalledTimes(1);
      expect(Vibration.cancel).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
