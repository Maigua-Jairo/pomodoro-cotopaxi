import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { BrandHeader } from '@/components/brand-header';
import { PhaseCard } from '@/components/phase-card';
import { ScreenFooter } from '@/components/screen-footer';
import { BRAND } from '@/constants/brand';
import { formatRemainingTime } from '@/domain/timer';
import { usePomodoroTimer } from '@/hooks/use-pomodoro-timer';

export default function BreakScreen() {
  const { breakTimer, breakType, isAlarmActive, startBreak, pauseBreak, resetBreak } =
    usePomodoroTimer();
  const [validationMessage, setValidationMessage] = useState('');
  const formattedTime = formatRemainingTime(breakTimer.remainingMs);
  const isRunning = breakTimer.status === 'running';
  const isPaused = breakTimer.status === 'paused';
  const hasElapsed = breakTimer.remainingMs < breakTimer.initialDurationMs;
  const breakLabel = breakType === 'long' ? 'Descanso largo' : 'Descanso corto';
  const status = isRunning
    ? 'Descanso en curso'
    : hasElapsed
      ? 'Descanso pausado'
      : 'Listo para descansar';
  const openSettings = () => router.push('/ajustes');

  useEffect(() => {
    if (!isAlarmActive && (breakType === null || breakTimer.initialDurationMs <= 0)) {
      router.replace('/(tabs)');
    }
  }, [breakTimer.initialDurationMs, breakType, isAlarmActive]);

  const handleStartBreak = () => {
    if (!startBreak()) {
      setValidationMessage('No hay un descanso preparado para iniciar.');
      return;
    }
    setValidationMessage('');
  };

  const handleResetBreak = () => {
    Alert.alert(
      'Reiniciar descanso',
      '¿Quieres volver al tiempo inicial del descanso y dejarlo pausado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: resetBreak },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BrandHeader
          illustration="coffee"
          rightAction={{ icon: 'settings', accessibilityLabel: 'Abrir ajustes', onPress: openSettings }}
          subtitle="Recarga energía para seguir"
          title={breakLabel}
        />

        <View style={styles.content}>
          <PhaseCard
            phaseIcon="coffee"
            phaseLabel={breakLabel}
            status={status}
            time={formattedTime}
            tone="break"
          />

          <View style={styles.controls}>
            {isPaused && (
              <ActionButton
                icon="play"
                label={hasElapsed ? 'Reanudar descanso' : 'Iniciar descanso'}
                onPress={handleStartBreak}
              />
            )}

            {isRunning && <ActionButton icon="pause" label="Pausar descanso" onPress={pauseBreak} />}

            {(isRunning || (isPaused && hasElapsed)) && (
              <ActionButton
                icon="restart"
                label="Reiniciar descanso"
                onPress={handleResetBreak}
                variant="danger"
              />
            )}
          </View>

          {validationMessage !== '' && (
            <Text accessibilityLiveRegion="polite" style={styles.validationMessage}>
              {validationMessage}
            </Text>
          )}
        </View>

        <ScreenFooter message="Un buen descanso también es parte del estudio." />
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
  validationMessage: {
    borderLeftColor: BRAND.crimson,
    borderLeftWidth: 4,
    color: BRAND.black,
    fontSize: 15,
    fontWeight: '600',
    paddingLeft: 8,
  },
});
