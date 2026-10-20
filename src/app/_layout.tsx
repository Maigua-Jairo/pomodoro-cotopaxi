import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';

import { usePomodoroTimer, PomodoroTimerProvider } from '@/hooks/use-pomodoro-timer';
import {
  ALARM_AUTO_STOP_MS,
  startPomodoroAlarm,
  stopPomodoroAlarm,
} from '@/notifications/pomodoro-alarm';
import {
  addPomodoroNotificationResponseListener,
  clearPomodoroNotificationResponse,
  hasInitialPomodoroCompletionResponse,
} from '@/notifications/pomodoro-notifications';

function NotificationNavigationHandler() {
  const { breakType, hydrationError, isHydrated, reportAlarmFailure, stopAlarm } =
    usePomodoroTimer();
  const hasPendingNotification = useRef(false);
  const [notificationResponseVersion, setNotificationResponseVersion] = useState(0);

  useEffect(() => {
    if (hasInitialPomodoroCompletionResponse()) {
      hasPendingNotification.current = true;
    }

    const subscription = addPomodoroNotificationResponseListener(() => {
      hasPendingNotification.current = true;
      setNotificationResponseVersion((version) => version + 1);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!hasPendingNotification.current || !isHydrated || hydrationError !== null) {
      return;
    }

    try {
      stopPomodoroAlarm();
    } catch (error: unknown) {
      console.error('No se pudo detener la alarma al abrir una notificación.', error);
      reportAlarmFailure();
    }
    stopAlarm();
    router.replace(breakType === null ? '/(tabs)' : '/descanso');
    clearPomodoroNotificationResponse();
    hasPendingNotification.current = false;
  }, [
    breakType,
    hydrationError,
    isHydrated,
    notificationResponseVersion,
    reportAlarmFailure,
    stopAlarm,
  ]);

  return null;
}

function PomodoroAlarmOverlay() {
  const { alarmPhase, breakType, isAlarmActive, reportAlarmFailure, stopAlarm } =
    usePomodoroTimer();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  const closeAlarm = useCallback(() => {
    try {
      stopPomodoroAlarm();
    } catch (error: unknown) {
      console.error('No se pudo detener la alarma del temporizador.', error);
      reportAlarmFailure();
    }
    stopAlarm();
    router.replace(breakType === null ? '/(tabs)' : '/descanso');
  }, [breakType, reportAlarmFailure, stopAlarm]);

  useEffect(() => {
    if (!isAlarmActive || alarmPhase === null || appState !== 'active') {
      return undefined;
    }

    let isCurrent = true;
    startPomodoroAlarm().catch((error: unknown) => {
      if (!isCurrent) {
        return;
      }
      console.error('No se pudo iniciar la alarma del temporizador.', error);
      reportAlarmFailure();
      stopAlarm();
    });
    const timeoutId = setTimeout(closeAlarm, ALARM_AUTO_STOP_MS);

    return () => {
      isCurrent = false;
      clearTimeout(timeoutId);
      try {
        stopPomodoroAlarm();
      } catch (error: unknown) {
        console.error('No se pudo limpiar la alarma del temporizador.', error);
      }
    };
  }, [alarmPhase, appState, closeAlarm, isAlarmActive, reportAlarmFailure, stopAlarm]);

  if (!isAlarmActive || alarmPhase === null) {
    return null;
  }

  const title = alarmPhase === 'focus' ? 'Estudio terminado' : 'Descanso terminado';

  return (
    <View pointerEvents="box-none" style={styles.alarmOverlay}>
      <View style={styles.alarmCard}>
        <Text style={styles.alarmTitle}>{title}</Text>
        <Text style={styles.alarmBody}>La fase terminó. Toca detener para continuar.</Text>
        <Pressable
          accessibilityLabel="Detener alarma del temporizador"
          accessibilityRole="button"
          onPress={() => {
            stopAlarm();
            router.replace(breakType === null ? '/(tabs)' : '/descanso');
          }}
          style={({ pressed }) => [styles.alarmButton, pressed && styles.alarmButtonPressed]}>
          <Text style={styles.alarmButtonText}>Detener</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NotificationAvailabilityBanner() {
  const { notificationMessage } = usePomodoroTimer();
  if (notificationMessage === null) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.availabilityBanner}>
      <Text accessibilityLiveRegion="polite" style={styles.availabilityMessage}>
        {notificationMessage}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <PomodoroTimerProvider>
      <NotificationNavigationHandler />
      <PomodoroAlarmOverlay />
      <NotificationAvailabilityBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </PomodoroTimerProvider>
  );
}

const styles = StyleSheet.create({
  alarmOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 0, 72, 0.52)',
  },
  availabilityBanner: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    zIndex: 40,
    elevation: 40,
    borderRadius: 12,
    backgroundColor: '#e60023',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  availabilityMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  alarmCard: {
    width: '84%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    gap: 14,
  },
  alarmTitle: {
    color: '#100048',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  alarmBody: {
    color: '#6A5751',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  alarmButton: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#F8A800',
    paddingVertical: 14,
    alignItems: 'center',
  },
  alarmButtonPressed: {
    opacity: 0.8,
  },
  alarmButtonText: {
    color: '#100048',
    fontSize: 18,
    fontWeight: '700',
  },
});
