import { useEffect, useState } from 'react';
import { router, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BrandHeader } from '@/components/brand-header';
import { ScreenFooter } from '@/components/screen-footer';
import { BRAND } from '@/constants/brand';

import {
  DEFAULT_SETTINGS,
  SETTINGS_FIELDS,
  SETTINGS_RANGES,
  validateSettingsInput,
  type PomodoroSettings,
  type SettingsErrors,
  type SettingsField,
  type SettingsInput,
} from '@/domain/settings';
import { usePomodoroTimer, type SaveSettingsResult } from '@/hooks/use-pomodoro-timer';

const DEFERRED_CHANGE_MESSAGE =
  'El nuevo tiempo se aplicará cuando termine la fase en curso o al presionar «Reiniciar».';

const FIELD_LABELS: Record<
  SettingsField,
  { label: string; unit: string; icon: AppIconName; tile: string; iconColor: string }
> = {
  focusMinutes: {
    label: 'Estudio',
    unit: 'minutos',
    icon: 'target',
    tile: BRAND.midnightBlue,
    iconColor: BRAND.orange,
  },
  shortBreakMinutes: {
    label: 'Descanso corto',
    unit: 'minutos',
    icon: 'coffee',
    tile: BRAND.orange,
    iconColor: BRAND.midnightBlue,
  },
  longBreakMinutes: {
    label: 'Descanso largo',
    unit: 'minutos',
    icon: 'sofa',
    tile: BRAND.crimson,
    iconColor: BRAND.white,
  },
  cycleLength: {
    label: 'Pomodoros por ciclo',
    unit: 'pomodoros',
    icon: 'cycle',
    tile: BRAND.midnightBlue,
    iconColor: BRAND.orange,
  },
};

function toInput(settings: PomodoroSettings): SettingsInput {
  return {
    focusMinutes: String(settings.focusMinutes),
    shortBreakMinutes: String(settings.shortBreakMinutes),
    longBreakMinutes: String(settings.longBreakMinutes),
    cycleLength: String(settings.cycleLength),
  };
}

function cycleGoalMessage(cycleLength: number): string {
  return `Ya completaste los ${cycleLength} pomodoros de este ciclo. Tu próximo descanso será el descanso largo.`;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, saveSettings, resetSettings } = usePomodoroTimer();
  const [inputs, setInputs] = useState<SettingsInput>(() => toInput(settings));
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [exitRequested, setExitRequested] = useState(false);
  const savedInputs = toInput(settings);
  const hasChanges = SETTINGS_FIELDS.some((field) => inputs[field] !== savedInputs[field]);

  usePreventRemove(hasChanges && !exitRequested, ({ data }) => {
    Alert.alert(
      'Cambios sin guardar',
      '¿Quieres descartar los cambios que hiciste en los ajustes?',
      [
        { text: 'Seguir editando', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
      { cancelable: true },
    );
  });

  useEffect(() => {
    if (!exitRequested) {
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [exitRequested]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleResult = (
    result: SaveSettingsResult,
    savedSettings: PomodoroSettings,
    onSuccess: () => void,
  ) => {
    if (!result.success) {
      setStatusMessage(result.message);
      return;
    }

    setStatusMessage('');
    const messages = [
      result.durationChangeDeferred ? DEFERRED_CHANGE_MESSAGE : null,
      result.cycleGoalReached ? cycleGoalMessage(savedSettings.cycleLength) : null,
    ].filter((message): message is string => message !== null);
    if (messages.length > 0) {
      Alert.alert('Ajustes guardados', messages.join('\n\n'), [
        { text: 'Entendido', onPress: onSuccess },
      ]);
      return;
    }

    onSuccess();
  };

  const handleSave = async () => {
    const validation = validateSettingsInput(inputs);
    if (!validation.success) {
      setErrors(validation.errors);
      setStatusMessage('No se guardó ningún cambio. Corrige los campos marcados.');
      return;
    }

    setErrors({});
    setIsSaving(true);
    const result = await saveSettings(validation.settings);
    setIsSaving(false);
    handleResult(result, validation.settings, () => setExitRequested(true));
  };

  const handleReset = () => {
    Alert.alert(
      'Restablecer valores por defecto',
      'Los tiempos volverán a 25 minutos de estudio, 5 de descanso corto, 15 de descanso largo y 4 pomodoros por ciclo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            const result = await resetSettings();
            setIsSaving(false);
            if (result.success) {
              setInputs(toInput(DEFAULT_SETTINGS));
              setErrors({});
            }
            handleResult(result, DEFAULT_SETTINGS, () =>
              setStatusMessage('Se restablecieron los valores por defecto.'),
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <BrandHeader illustration="school" onBack={goBack} title="Ajustes" />

          <View style={styles.content}>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <AppIcon color={BRAND.white} name="info" size={22} />
              </View>
              <Text style={styles.infoText}>
                Los cambios se aplican desde la siguiente fase. La fase en curso termina con su
                tiempo original.
              </Text>
            </View>

            {SETTINGS_FIELDS.map((field) => {
              const { label, unit, icon, tile, iconColor } = FIELD_LABELS[field];
              const { min, max } = SETTINGS_RANGES[field];
              const error = errors[field];
              return (
                <View key={field} style={[styles.fieldCard, error !== undefined && styles.fieldCardError]}>
                  <View style={styles.fieldRow}>
                    <View style={[styles.fieldTile, { backgroundColor: tile }]}>
                      <AppIcon color={iconColor} name={icon} size={30} />
                    </View>
                    <Text nativeID={`${field}-label`} style={styles.label}>
                      {label} <Text style={styles.range}>({min}–{max} {unit})</Text>
                    </Text>
                    <View style={[styles.inputBox, error !== undefined && styles.inputError]}>
                      <TextInput
                        accessibilityHint={`Valor entre ${min} y ${max}`}
                        accessibilityLabel={`${label} en ${unit}`}
                        accessibilityLabelledBy={`${field}-label`}
                        autoCorrect={false}
                        keyboardType="number-pad"
                        maxLength={3}
                        onChangeText={(value) => {
                          setInputs((current) => ({ ...current, [field]: value }));
                          setErrors((current) => ({ ...current, [field]: undefined }));
                          setStatusMessage('');
                        }}
                        returnKeyType="done"
                        style={styles.input}
                        value={inputs[field]}
                      />
                      <AppIcon color={BRAND.secondaryText} name="clock" size={20} />
                    </View>
                  </View>
                  {error !== undefined && (
                    <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                      {error}
                    </Text>
                  )}
                </View>
              );
            })}

            {statusMessage !== '' && (
              <Text accessibilityLiveRegion="polite" style={styles.statusMessage}>
                {statusMessage}
              </Text>
            )}

            <View style={styles.controls}>
              <ActionButton
                accessibilityLabel="Guardar ajustes"
                disabled={isSaving}
                icon="save"
                label={isSaving ? 'Guardando…' : 'Guardar'}
                layout="centered"
                onPress={handleSave}
              />
              <ActionButton
                accessibilityLabel="Restablecer valores por defecto"
                disabled={isSaving}
                icon="restart"
                label="Restablecer valores por defecto"
                layout="centered"
                onPress={handleReset}
                variant="danger"
              />
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <AppIcon color={BRAND.white} name="shield" size={22} />
              </View>
              <Text style={styles.infoText}>
                Tus ajustes se guardan solo en este celular. Si desinstalas la aplicación, se
                borrarán.
              </Text>
            </View>
          </View>

          <ScreenFooter icon="school" message="¡Tú puedes!" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: BRAND.whitesmoke,
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: 14,
    maxWidth: 560,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    width: '100%',
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: BRAND.softMidnightTint,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: BRAND.midnightBlue,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  infoText: {
    color: BRAND.midnightBlue,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldCard: {
    backgroundColor: BRAND.white,
    borderColor: BRAND.white,
    borderRadius: 20,
    borderWidth: 2,
    elevation: 2,
    gap: 8,
    padding: 12,
    shadowColor: BRAND.midnightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  fieldCardError: {
    borderColor: BRAND.crimson,
  },
  fieldRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  fieldTile: {
    alignItems: 'center',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  label: {
    color: BRAND.midnightBlue,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  range: {
    color: BRAND.midnightBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  inputBox: {
    alignItems: 'center',
    backgroundColor: BRAND.white,
    borderColor: BRAND.silver,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
    width: 112,
  },
  input: {
    color: BRAND.black,
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    minHeight: 48,
    paddingVertical: 0,
  },
  inputError: {
    borderColor: BRAND.crimson,
  },
  errorText: {
    borderLeftColor: BRAND.crimson,
    borderLeftWidth: 4,
    color: BRAND.black,
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 8,
  },
  statusMessage: {
    color: BRAND.midnightBlue,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    gap: 14,
    marginTop: 8,
  },
});
