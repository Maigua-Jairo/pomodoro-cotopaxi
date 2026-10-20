import { useMemo, useState } from 'react';
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
    breakTimer,
    pomodoroCount,
    cycleLength,
    breakType,
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
    startBreak,
    pauseBreak,
    resetBreak,
    stopBreak,
    recoverFromHydrationError,
    requestNotificationPermission,
  } = usePomodoroTimer();
  const [breakMessage, setBreakMessage] = useState('');
  const isBreak = breakType !== null;
  const timer = isBreak ? breakTimer : focusTimer;
  const formattedTime = useMemo(() => formatRemainingTime(timer.remainingMs), [timer.remainingMs]);
  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';
  const isFinished = timer.status === 'finished';
  const isResuming = isPaused && timer.remainingMs < timer.initialDurationMs;
  const breakLabel = breakType === 'long' ? 'Descanso largo' : 'Descanso corto';

  const confirm = (title: string, message: string, action: string, onConfirm: () => void) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: action, style: 'destructive', onPress: onConfirm },
      ],
      { cancelable: true },
    );
  };

  const handleReset = () =>
    isBreak
      ? confirm(
          'Reiniciar descanso',
          '¿Quieres volver al tiempo inicial del descanso y dejarlo pausado?',
          'Reiniciar',
          resetBreak,
        )
      : confirm(
          'Reiniciar temporizador',
          '¿Quieres volver al tiempo inicial de concentración?',
          'Reiniciar',
          resetFocus,
        );

  const handleStop = () =>
    isBreak
      ? confirm(
          'Detener descanso',
          'Volverás al estudio, listo para iniciar. ¿Quieres detener el descanso?',
          'Detener',
          stopBreak,
        )
      : confirm(
          'Detener estudio',
          'El estudio no contará como pomodoro y pasarás a un descanso corto. ¿Quieres detenerlo?',
          'Detener',
          stopFocus,
        );

  const handleBreakStart = () => {
    if (isRunning) {
      pauseBreak();
      return;
    }
    setBreakMessage(startBreak() ? '' : 'No hay un descanso preparado para iniciar.');
  };

  const handleFocusStart = () => {
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

  const status = isBreak
    ? isRunning
      ? 'Descanso en curso'
      : isResuming
        ? 'Descanso pausado'
        : 'Listo para descansar'
    : isRunning
      ? 'Sesión en curso'
      : isFinished
        ? 'Sesión finalizada'
        : isResuming
          ? 'Sesión pausada'
          : 'Listo para concentrarte';
  const phaseName = isBreak ? 'descanso' : 'temporizador';
  const startLabel = isRunning
    ? 'Pausar'
    : isFinished
      ? 'Finalizado'
      : isResuming
        ? 'Reanudar'
        : 'Iniciar';
  const openSettings = () => router.push('/ajustes');

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader
          illustration={isBreak ? 'coffee' : 'school'}
          rightAction={{ icon: 'settings', accessibilityLabel: 'Abrir ajustes', onPress: openSettings }}
          subtitle={isBreak ? 'Recarga energía para seguir' : 'Enfócate hoy, logra mañana'}
          title={isBreak ? breakLabel : 'Temporizador'}
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
                phaseIcon={isBreak ? 'coffee' : 'target'}
                phaseLabel={isBreak ? breakLabel : 'Estudio'}
                status={status}
                time={formattedTime}
                tone={isBreak ? 'break' : 'study'}
              />

              <View style={styles.controls}>
                <ActionButton
                  accessibilityLabel={`${startLabel} ${phaseName}`}
                  disabled={isFinished}
                  icon={isRunning ? 'pause' : 'play'}
                  label={isBreak && !isFinished ? `${startLabel} descanso` : startLabel}
                  onPress={isBreak ? handleBreakStart : handleFocusStart}
                />

                {(isRunning || isResuming) && (
                  <ActionButton
                    accessibilityLabel={isBreak ? 'Detener descanso' : 'Detener estudio'}
                    icon="stop"
                    label="Detener"
                    onPress={handleStop}
                    variant="secondary"
                  />
                )}

                {(isBreak ? isRunning || isResuming : !isFinished) && (
                  <ActionButton
                    accessibilityLabel={`Reiniciar ${phaseName}`}
                    icon="restart"
                    label={isBreak ? 'Reiniciar descanso' : 'Reiniciar'}
                    onPress={handleReset}
                    variant="danger"
                  />
                )}
              </View>

              {isBreak && breakMessage !== '' && (
                <Text accessibilityLiveRegion="polite" style={styles.breakMessage}>
                  {breakMessage}
                </Text>
              )}
            </>
          )}
        </View>

        {notificationMessage !== null && (
          <Text accessibilityLiveRegion="polite" style={styles.discreetNotice}>
            {notificationMessage}
          </Text>
        )}

        <ScreenFooter
          message={
            isBreak
              ? 'Un buen descanso también es parte del estudio.'
              : 'Puedes pausar y continuar cuando lo necesites.'
          }
        />
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
  breakMessage: {
    borderLeftColor: BRAND.crimson,
    borderLeftWidth: 4,
    color: BRAND.black,
    fontSize: 15,
    fontWeight: '600',
    paddingLeft: 8,
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
