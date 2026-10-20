import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

interface HeaderAction {
  icon: AppIconName;
  accessibilityLabel: string;
  onPress: () => void;
}

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  illustration?: AppIconName;
}

function HeaderButton({ icon, accessibilityLabel, onPress }: HeaderAction) {
  return (
    <Pressable
      accessibilityHint="Abre la pantalla para cambiar los tiempos del pomodoro"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <AppIcon color={BRAND.white} name={icon} size={24} />
    </Pressable>
  );
}

export function BrandHeader({
  title,
  subtitle,
  onBack,
  leftAction,
  rightAction,
  illustration = 'school',
}: BrandHeaderProps) {
  const insets = useSafeAreaInsets();

  if (onBack !== undefined) {
    return (
      <View style={[styles.header, styles.compactHeader, { paddingTop: insets.top + 12 }]}>
        <StatusBar style="light" />
        <View pointerEvents="none" style={styles.compactIllustration}>
          <AppIcon color={BRAND.orange} name={illustration} size={72} />
        </View>
        <View style={styles.compactRow}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            hitSlop={6}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <AppIcon color={BRAND.white} name="chevronLeft" size={20} />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>
          <View>
            <Text accessibilityRole="header" style={styles.compactTitle}>
              {title}
            </Text>
            <View style={styles.underline} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.illustration}>
        <AppIcon color={BRAND.orange} name={illustration} size={88} />
      </View>

      <View style={styles.topRow}>
        {leftAction !== undefined && <HeaderButton {...leftAction} />}
        <View style={styles.brandRow}>
          <AppIcon color={BRAND.orange} name="school" size={26} />
          <Text style={styles.brand}>ACADEMIA COTOPAXI</Text>
        </View>
        {rightAction !== undefined && <HeaderButton {...rightAction} />}
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <View style={styles.underline} />
      {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: BRAND.midnightBlue,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 96,
    overflow: 'hidden',
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  compactHeader: {
    paddingBottom: 28,
  },
  compactIllustration: {
    opacity: 0.35,
    position: 'absolute',
    right: 28,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  compactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minHeight: 44,
    minWidth: 44,
  },
  backText: {
    color: BRAND.white,
    fontSize: 18,
    fontWeight: '700',
  },
  compactTitle: {
    color: BRAND.white,
    fontSize: 32,
    fontWeight: '800',
  },
  illustration: {
    bottom: 18,
    opacity: 0.35,
    position: 'absolute',
    right: 28,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
  },
  brandRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  brand: {
    color: BRAND.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: BRAND.softWhite,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  title: {
    color: BRAND.white,
    fontSize: 38,
    fontWeight: '800',
    marginTop: 12,
  },
  underline: {
    backgroundColor: BRAND.orange,
    borderRadius: 3,
    height: 6,
    marginTop: 4,
    width: 84,
  },
  subtitle: {
    color: BRAND.silver,
    fontSize: 15,
    marginTop: 10,
    maxWidth: '70%',
  },
  pressed: {
    opacity: 0.75,
  },
});
