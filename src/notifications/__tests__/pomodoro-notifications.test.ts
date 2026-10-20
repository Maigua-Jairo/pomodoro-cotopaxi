import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import type { NotificationResponse } from 'expo-notifications/build/Notifications.types';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
import { PermissionStatus } from 'expo-modules-core';

import type { TimerPhase } from '@/domain/timer';
import type { NotificationPermissionsStatus } from 'expo-notifications/build/NotificationPermissions.types';
import {
  cancelPomodoroNotification,
  configurePomodoroNotificationHandler,
  addPomodoroNotificationResponseListener,
  clearPomodoroNotificationResponse,
  hasInitialPomodoroCompletionResponse,
  isPomodoroCompletionResponse,
  getPomodoroNotificationBehavior,
  requestPomodoroNotificationPermission,
  schedulePomodoroCompletionNotification,
} from '../pomodoro-notifications';

jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  cancelScheduledNotificationAsync: jest.fn(),
}));
jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));
jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: jest.fn(),
}));
jest.mock('expo-notifications/build/Notifications.types', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));
jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  scheduleNotificationAsync: jest.fn(),
}));
jest.mock('expo-notifications/build/NotificationsEmitter', () => ({
  addNotificationResponseReceivedListener: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
  getLastNotificationResponse: jest.fn(),
}));
const grantedPermissions: NotificationPermissionsStatus = {
  status: PermissionStatus.GRANTED,
  granted: true,
  canAskAgain: true,
  expires: 'never',
};
const deniedPermissions: NotificationPermissionsStatus = {
  ...grantedPermissions,
  status: PermissionStatus.DENIED,
  granted: false,
};
const phaseTitleCases: [TimerPhase, string][] = [
  ['focus', 'Estudio terminado'],
  ['break', 'Descanso terminado'],
];
function createResponse(data: Record<string, unknown>): NotificationResponse {
  return {
    actionIdentifier: 'expo.modules.notifications.actions.DEFAULT',
    notification: {
      date: Date.now(),
      request: {
        identifier: 'notification-1',
        content: {
          title: null,
          subtitle: null,
          body: null,
          data,
          categoryIdentifier: null,
          sound: null,
        },
        trigger: null,
      },
    },
  };
}

describe('Pomodoro notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getPermissionsAsync).mockResolvedValue(grantedPermissions);
    jest.mocked(requestPermissionsAsync).mockResolvedValue(grantedPermissions);
    jest.mocked(scheduleNotificationAsync).mockResolvedValue('notification-1');
    jest.mocked(cancelScheduledNotificationAsync).mockResolvedValue(undefined);
    jest.mocked(addNotificationResponseReceivedListener).mockReturnValue({ remove: jest.fn() });
    jest.mocked(getLastNotificationResponse).mockReturnValue(null);
  });

  it('uses an existing notification permission without prompting again', async () => {
    await expect(requestPomodoroNotificationPermission()).resolves.toBe(true);

    expect(requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests notification permission when it has not been granted', async () => {
    jest.mocked(getPermissionsAsync).mockResolvedValue(deniedPermissions);
    jest.mocked(requestPermissionsAsync).mockResolvedValue(grantedPermissions);

    await expect(requestPomodoroNotificationPermission()).resolves.toBe(true);

    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('reports that a notification is unavailable without permission', async () => {
    jest.mocked(getPermissionsAsync).mockResolvedValue(deniedPermissions);

    await expect(
      schedulePomodoroCompletionNotification('focus', Date.now() + 60_000),
    ).resolves.toEqual({ status: 'unavailable', reason: 'permission-denied' });

    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules a notification even while the app is in the foreground', async () => {
    await expect(
      schedulePomodoroCompletionNotification('focus', Date.now() + 60_000),
    ).resolves.toEqual({ status: 'scheduled', notificationId: 'notification-1' });

    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it.each(phaseTitleCases)('schedules the correct completion message for %s', async (phase, title) => {
    const expiresAtEpochMs = Date.now() + 60_000;

    await expect(
      schedulePomodoroCompletionNotification(phase, expiresAtEpochMs),
    ).resolves.toEqual({ status: 'scheduled', notificationId: 'notification-1' });

    expect(scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title,
        body: 'La fase siguiente está lista para iniciar.',
        data: { type: 'pomodoro-phase-complete', phase },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: new Date(expiresAtEpochMs),
      },
    });
  });

  it('propagates errors when scheduling a notification fails', async () => {
    const error = new Error('schedule failed');
    jest.mocked(scheduleNotificationAsync).mockRejectedValue(error);

    await expect(
      schedulePomodoroCompletionNotification('focus', Date.now() + 60_000),
    ).rejects.toBe(error);
  });

  it('cancels only the notification identifier provided', async () => {
    await cancelPomodoroNotification('notification-1');
    await cancelPomodoroNotification(null);

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-1');
  });

  it('configures foreground delivery to be suppressed and background delivery to be shown', () => {
    expect(getPomodoroNotificationBehavior(true)).toEqual({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    });
    expect(getPomodoroNotificationBehavior(false)).toEqual({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    });

    configurePomodoroNotificationHandler();
    expect(setNotificationHandler).toHaveBeenCalledTimes(1);
  });

  it('recognizes only this app’s valid phase-completion responses', () => {
    const response = createResponse({ type: 'pomodoro-phase-complete', phase: 'focus' });

    expect(isPomodoroCompletionResponse(response)).toBe(true);
    expect(
      isPomodoroCompletionResponse(createResponse({ type: 'other', phase: 'focus' })),
    ).toBe(false);
    expect(
      isPomodoroCompletionResponse(
        createResponse({ type: 'pomodoro-phase-complete', phase: 'invalid' }),
      ),
    ).toBe(false);
    expect(hasInitialPomodoroCompletionResponse()).toBe(false);
  });

  it('notifies the route handler when a Pomodoro completion is tapped and can clear its response', () => {
    const response = createResponse({ type: 'pomodoro-phase-complete', phase: 'break' });
    const handler = jest.fn();
    jest.mocked(addNotificationResponseReceivedListener).mockImplementation((listener) => {
      listener(response);
      return { remove: jest.fn() };
    });

    const subscription = addPomodoroNotificationResponseListener(handler);
    clearPomodoroNotificationResponse();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(subscription.remove).toBeDefined();
    expect(clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });
});
