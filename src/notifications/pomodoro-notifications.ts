import { AppState, Platform } from 'react-native';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import {
  setNotificationHandler,
  type NotificationHandler,
} from 'expo-notifications/build/NotificationsHandler';
import {
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

export function getPomodoroNotificationBehavior(
  isForeground: boolean,
): NotificationBehavior {
  return {
    shouldPlaySound: false,
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

  const notificationId = await scheduleNotificationAsync({
    content: {
      title: phase === 'focus' ? 'Estudio terminado' : 'Descanso terminado',
      body: 'La fase siguiente está lista para iniciar.',
      data: { type: 'pomodoro-phase-complete', phase },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: new Date(expiresAtEpochMs),
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
