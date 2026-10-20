import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Vibration } from 'react-native';

const vibrationPattern = [400, 200, 400, 200, 400];
const vibrationIntervalMs = 1_600;
export const ALARM_AUTO_STOP_MS = 3_000;
const alarmAudio = require('../../assets/audio/pomodoro-alarm.wav');

let player: AudioPlayer | null = null;
let vibrationInterval: ReturnType<typeof setInterval> | null = null;
let alarmGeneration = 0;

export async function startPomodoroAlarm(): Promise<void> {
  stopPomodoroAlarm();
  const generation = ++alarmGeneration;

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    if (generation !== alarmGeneration) {
      return;
    }

    player = createAudioPlayer(alarmAudio, { updateInterval: 1_000 });
    player.loop = true;
    Vibration.vibrate(vibrationPattern);
    vibrationInterval = setInterval(() => {
      Vibration.vibrate(vibrationPattern);
    }, vibrationIntervalMs);
    player.play();
  } catch (error: unknown) {
    if (generation === alarmGeneration) {
      stopPomodoroAlarm();
    }
    throw error;
  }
}

export function stopPomodoroAlarm(): void {
  alarmGeneration += 1;

  if (player === null && vibrationInterval === null) {
    return;
  }

  if (vibrationInterval !== null) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }

  const activePlayer = player;
  player = null;

  try {
    Vibration.cancel();
  } finally {
    activePlayer?.remove();
  }
}
