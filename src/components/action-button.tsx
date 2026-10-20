import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

type Variant = 'primary' | 'danger' | 'secondary';

interface ActionButtonProps {
  label: string;
  icon: AppIconName;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  layout?: 'row' | 'centered';
}

const VARIANTS: Record<
  Variant,
  { background: string; text: string; circle: string; icon: string }
> = {
  primary: {
    background: BRAND.orange,
    text: BRAND.midnightBlue,
    circle: BRAND.midnightBlue,
    icon: BRAND.orange,
  },
  danger: {
    background: BRAND.crimson,
    text: BRAND.white,
    circle: BRAND.softMidnight,
    icon: BRAND.white,
  },
  secondary: {
    background: BRAND.midnightBlue,
    text: BRAND.white,
    circle: BRAND.softWhite,
    icon: BRAND.white,
  },
};

export function ActionButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  layout = 'row',
}: ActionButtonProps) {
  const colors = VARIANTS[variant];
  const isCentered = layout === 'centered';

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isCentered && styles.centeredButton,
        { backgroundColor: colors.background },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {isCentered ? (
        <>
          <Sparks color={variant === 'primary' ? BRAND.white : BRAND.orange} side="left" />
          <AppIcon color={colors.text} name={icon} size={30} />
          <Text numberOfLines={1} style={[styles.centeredLabel, { color: colors.text }]}>
            {label}
          </Text>
          <Sparks color={variant === 'primary' ? BRAND.white : BRAND.orange} side="right" />
        </>
      ) : (
        <>
          <View style={[styles.iconCircle, { backgroundColor: colors.circle }]}>
            <AppIcon color={colors.icon} name={icon} size={26} />
          </View>
          <Text numberOfLines={1} style={[styles.label, { color: colors.text }]}>
            {label}
          </Text>
          <AppIcon color={colors.text} name="chevronRight" size={22} />
        </>
      )}
    </Pressable>
  );
}

function Sparks({ color, side }: { color: string; side: 'left' | 'right' }) {
  const sign = side === 'left' ? 1 : -1;
  return (
    <View pointerEvents="none" style={styles.sparks}>
      <View style={[styles.spark, { backgroundColor: color, transform: [{ rotate: `${35 * sign}deg` }] }]} />
      <View style={[styles.spark, { backgroundColor: color }]} />
      <View style={[styles.spark, { backgroundColor: color, transform: [{ rotate: `${-35 * sign}deg` }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredButton: {
    justifyContent: 'center',
    paddingLeft: 22,
  },
  centeredLabel: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  sparks: {
    gap: 5,
  },
  spark: {
    borderRadius: 2,
    height: 3,
    width: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 34,
    elevation: 4,
    flexDirection: 'row',
    gap: 16,
    minHeight: 68,
    paddingLeft: 10,
    paddingRight: 22,
    paddingVertical: 10,
    shadowColor: BRAND.midnightBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  label: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
