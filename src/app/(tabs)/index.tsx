import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { AppIcon } from '@/components/app-icon';
import { BrandHeader } from '@/components/brand-header';
import { PhaseCard } from '@/components/phase-card';
import { ScreenFooter } from '@/components/screen-footer';
import { BRAND } from '@/constants/brand';
import { formatRemainingTime } from '@/domain/timer';
import { usePomodoroTimer } from '@/hooks/use-pomodoro-timer';

export default function HomeScreen() {
  const {
    focusTimer,
    pomodoroCount,
    cycleLength,
    breakType,
    isAlarmActive,
    isHydrated,
    hydrationError,
    hasStartedSession,
    settingsMessage,
    notificationMessage,
    storageMessage,
    dismissStorageMessage,
    startFocus,
    pauseFocus,
    resetFocus,
    stopFocus,
    recoverFromHydrationError,
    requestNotificationPermission,
  } = usePomodoroTimer();
  const formattedTime = useMemo(
    () => formatRemainingTime(focusTimer.remainingMs),
    [focusTimer.remainingMs],
  );
  const isRunning = focusTimer.status === 'running';
  const isPaused = focusTimer.status === 'paused';
  const isFinished = focusTimer.status === 'finished';
  const isResuming = isPaused && focusTimer.remainingMs < focusTimer.initialDurationMs;

  useEffect(() => {
    if (breakType !== null && !isAlarmActive) {
      router.replace('/descanso');
    }
  }, [breakType, isAlarmActive]);

  const handleReset = () => {
    Alert.alert(
      'Reiniciar temporizador',
      '¿Quieres volver al tiempo inicial de concentración?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: resetFocus },
      ],
      { cancelable: true },
    );
  };

  const handleStop = () => {
    Alert.alert(
      'Detener estudio',
      'El estudio no contará como pomodoro y pasarás a un descanso corto. ¿Quieres detenerlo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Detener', style: 'destructive', onPress: stopFocus },
      ],
      { cancelable: true },
    );
  };

  const handleStart = () => {
    if (isRunning) {
      pauseFocus();
      return;
    }
    if (hasStartedSession) {
      startFocus();
      return;
    }

    Alert.alert(
      'Aviso al terminar',
      'Las notificaciones permiten avisarte cuando termine una fase si la aplicación está cerrada.',
      [
        {
          text: 'Continuar',
          onPress: () => {
            startFocus();
            requestNotificationPermission().catch(() => {
              // El proveedor ya muestra el aviso de error; el temporizador sigue corriendo.
            });
          },
        },
      ],
      { cancelable: false },
    );
  };

  const status = isRunning
    ? 'Sesión en curso'
    : isFinished
      ? 'Sesión finalizada'
      : isResuming
        ? 'Sesión pausada'
        : 'Listo para concentrarte';
  const openSettings = () => router.push('/ajustes');

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader
          rightAction={{ icon: 'settings', accessibilityLabel: 'Abrir ajustes', onPress: openSettings }}
          subtitle="Enfócate hoy, logra mañana"
          title="Temporizador"
        />

        <View style={styles.content}>
          {!isHydrated ? (
            <Text accessibilityLiveRegion="polite" style={styles.statusMessage}>
              Restaurando la sesión guardada…
            </Text>
          ) : hydrationError !== null ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>No se pudo restaurar la sesión.</Text>
              <Text style={styles.noticeMessage}>
                El temporizador permanecerá pausado. Detalle: {hydrationError}
              </Text>
              <ActionButton
                icon="restart"
                label="Iniciar una sesión nueva"
                onPress={recoverFromHydrationError}
              />
            </View>
          ) : (
            <>
              {storageMessage !== null && (
                <View accessibilityLiveRegion="polite" style={styles.noticeCard}>
                  <Text style={styles.noticeMessage}>{storageMessage}</Text>
                  <Pressable
                    accessibilityLabel="Cerrar aviso de guardado"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={dismissStorageMessage}
                    style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                    <AppIcon color={BRAND.midnightBlue} name="close" size={18} />
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </Pressable>
                </View>
              )}

              {settingsMessage !== null && (
                <View accessibilityLiveRegion="polite" style={styles.noticeCard}>
                  <Text style={styles.noticeMessage}>{settingsMessage}</Text>
                  <ActionButton
                    icon="settings"
                    label="Ir a Ajustes"
                    onPress={openSettings}
                    variant="secondary"
                  />
                </View>
              )}

              <PhaseCard
                footer={
                  <View style={styles.progressPill}>
                    <AppIcon color={BRAND.orange} name="group" size={22} />
                    <Text style={styles.progressLabel}>Pomodoros:</Text>
                    <Text style={styles.progressValue}>
                      {pomodoroCount}/{cycleLength}
                    </Text>
                  </View>
                }
                phaseIcon="target"
                phaseLabel="Estudio"
                status={status}
                time={formattedTime}
              />

              <View style={styles.controls}>
                <ActionButton
                  accessibilityLabel={
                    isRunning
                      ? 'Pausar temporizador'
                      : isResuming
                        ? 'Reanudar temporizador'
                        : 'Iniciar temporizador'
                  }
                  disabled={isFinished}
                  icon={isRunning ? 'pause' : 'play'}
                  label={
                    isRunning
                        ? 'Pausar'
                        : isFinished
                          ? 'Finalizado'
                          : isResuming
                            ? 'Reanudar'
                            : 'Iniciar'
                  }
                  onPress={handleStart}
                />

                {(isRunning || isResuming) && (
                  <ActionButton
                    accessibilityLabel="Detener estudio"
                    icon="stop"
                    label="Detener"
                    onPress={handleStop}
                    variant="secondary"
                  />
                )}

                {!isFinished && (
                  <ActionButton
                    accessibilityLabel="Reiniciar temporizador"
                    icon="restart"
                    label="Reiniciar"
                    onPress={handleReset}
                    variant="danger"
                  />
                )}
              </View>
            </>
          )}
        </View>

        {notificationMessage !== null && (
          <Text accessibilityLiveRegion="polite" style={styles.discreetNotice}>
            {notificationMessage}
          </Text>
        )}

        <ScreenFooter message="Puedes pausar y continuar cuando lo necesites." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: BRAND.whitesmoke,
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: 22,
    maxWidth: 560,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
  },
  controls: {
    gap: 14,
  },
  progressPill: {
    alignItems: 'center',
    borderColor: BRAND.softWhite,
    borderRadius: 24,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  progressLabel: {
    color: BRAND.white,
    fontSize: 17,
    fontWeight: '600',
  },
  progressValue: {
    color: BRAND.orange,
    fontSize: 20,
    fontWeight: '800',
  },
  statusMessage: {
    color: BRAND.midnightBlue,
    fontSize: 16,
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: BRAND.white,
    borderColor: BRAND.crimson,
    borderRadius: 20,
    borderWidth: 2,
    gap: 14,
    padding: 18,
  },
  noticeTitle: {
    color: BRAND.crimson,
    fontSize: 18,
    fontWeight: '800',
  },
  noticeMessage: {
    color: BRAND.midnightBlue,
    fontSize: 15,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderColor: BRAND.midnightBlue,
    borderRadius: 22,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: BRAND.midnightBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  discreetNotice: {
    alignSelf: 'center',
    color: BRAND.secondaryText,
    fontSize: 12,
    maxWidth: 560,
    paddingHorizontal: 32,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
