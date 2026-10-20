import { AppState, Platform } from 'react-native';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import {
  setNotificationHandler,
  type NotificationHandler,
} from 'expo-notifications/build/NotificationsHandler';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import {
  AndroidNotificationPriority,
  SchedulableTriggerInputTypes,
  type NotificationBehavior,
  type NotificationResponse,
} from 'expo-notifications/build/Notifications.types';
import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
import type { EventSubscription } from 'expo-modules-core';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

import type { TimerPhase } from '@/domain/timer';

export const POMODORO_NOTIFICATION_CHANNEL_ID = 'pomodoro-phase-complete';
export const POMODORO_VIBRATION_PATTERN = [0, 500, 250, 500, 250, 500];

export async function ensurePomodoroNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await setNotificationChannelAsync(POMODORO_NOTIFICATION_CHANNEL_ID, {
    name: 'Fin de fase del Pomodoro',
    importance: AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: POMODORO_VIBRATION_PATTERN,
    enableVibrate: true,
  });
}

export function getPomodoroNotificationBehavior(
  isForeground: boolean,
): NotificationBehavior {
  return {
    shouldPlaySound: !isForeground,
    shouldSetBadge: false,
    shouldShowBanner: !isForeground,
    shouldShowList: !isForeground,
  };
}

export function configurePomodoroNotificationHandler(): void {
  const handler: NotificationHandler = {
    handleNotification: async () =>
      getPomodoroNotificationBehavior(AppState.currentState === 'active'),
  };
  setNotificationHandler(handler);
}

export type PomodoroNotificationScheduleResult =
  | { status: 'scheduled'; notificationId: string }
  | { status: 'unavailable'; reason: 'unsupported' | 'permission-denied' };

export async function requestPomodoroNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  // En Android 13+ el diálogo de permiso solo aparece si ya existe un canal.
  await ensurePomodoroNotificationChannel();
  const currentPermission = await getPermissionsAsync();
  if (currentPermission.granted || currentPermission.status === 'granted') {
    return true;
  }

  const requestedPermission = await requestPermissionsAsync();
  return requestedPermission.granted || requestedPermission.status === 'granted';
}

export async function schedulePomodoroCompletionNotification(
  phase: TimerPhase,
  expiresAtEpochMs: number,
): Promise<PomodoroNotificationScheduleResult> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', reason: 'unsupported' };
  }
  if (!Number.isFinite(expiresAtEpochMs) || expiresAtEpochMs <= Date.now()) {
    throw new RangeError('Notification expiry must be a finite future timestamp.');
  }

  const permission = await getPermissionsAsync();
  if (!permission.granted && permission.status !== 'granted') {
    return { status: 'unavailable', reason: 'permission-denied' };
  }

  await ensurePomodoroNotificationChannel();
  const notificationId = await scheduleNotificationAsync({
    content: {
      title: phase === 'focus' ? 'Estudio terminado' : 'Descanso terminado',
      body: 'La fase siguiente está lista para iniciar.',
      data: { type: 'pomodoro-phase-complete', phase },
      sound: 'default',
      vibrate: POMODORO_VIBRATION_PATTERN,
      priority: AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: new Date(expiresAtEpochMs),
      channelId: POMODORO_NOTIFICATION_CHANNEL_ID,
    },
  });
  return { status: 'scheduled', notificationId };
}

export async function cancelPomodoroNotification(notificationId: string | null): Promise<void> {
  if (notificationId !== null) {
    await cancelScheduledNotificationAsync(notificationId);
  }
}

export function isPomodoroCompletionResponse(
  response: NotificationResponse | null,
): boolean {
  const data = response?.notification.request.content.data;
  return (
    data?.type === 'pomodoro-phase-complete' &&
    (data.phase === 'focus' || data.phase === 'break')
  );
}

export function hasInitialPomodoroCompletionResponse(): boolean {
  return isPomodoroCompletionResponse(getLastNotificationResponse());
}

export function addPomodoroNotificationResponseListener(
  listener: () => void,
): EventSubscription {
  return addNotificationResponseReceivedListener((response) => {
    if (isPomodoroCompletionResponse(response)) {
      listener();
    }
  });
}

export function clearPomodoroNotificationResponse(): void {
  clearLastNotificationResponse();
}
