import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

interface PhaseCardProps {
  phaseLabel: string;
  phaseIcon: AppIconName;
  time: string;
  status?: string;
  tone?: 'study' | 'break';
  footer?: ReactNode;
}

export function PhaseCard({
  phaseLabel,
  phaseIcon,
  time,
  status,
  tone = 'study',
  footer,
}: PhaseCardProps) {
  const background = tone === 'study' ? BRAND.midnightBlue : BRAND.teal;

  return (
    <View
      accessibilityLabel={`${phaseLabel}. Tiempo restante ${time}${status ? `. ${status}` : ''}`}
      accessibilityRole="timer"
      style={[styles.card, { backgroundColor: background }]}>
      <View pointerEvents="none" style={styles.arc} />
      <View pointerEvents="none" style={[styles.tick, styles.tickLeftTop]} />
      <View pointerEvents="none" style={[styles.tick, styles.tickLeftBottom]} />
      <View pointerEvents="none" style={[styles.tick, styles.tickRightTop]} />
      <View pointerEvents="none" style={[styles.tick, styles.tickRightBottom]} />

      <View style={styles.phasePill}>
        <AppIcon color={BRAND.midnightBlue} name={phaseIcon} size={22} />
        <Text style={styles.phaseText}>{phaseLabel}</Text>
      </View>

      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.time}>
        {time}
      </Text>

      {status !== undefined && (
        <View style={styles.statusRow}>
          <AppIcon color={BRAND.silver} name="brain" size={20} />
          <Text style={styles.status}>{status}</Text>
        </View>
      )}

      {footer !== undefined && (
        <>
          <View style={styles.divider} />
          {footer}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 32,
    elevation: 6,
    gap: 14,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: BRAND.midnightBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  arc: {
    alignSelf: 'center',
    borderColor: BRAND.white,
    borderRadius: 160,
    borderWidth: 6,
    height: 320,
    opacity: 0.08,
    position: 'absolute',
    top: 18,
    width: 320,
  },
  tick: {
    backgroundColor: BRAND.orange,
    borderRadius: 3,
    height: 5,
    position: 'absolute',
    width: 18,
  },
  tickLeftTop: { left: 22, top: 92, transform: [{ rotate: '45deg' }] },
  tickLeftBottom: { left: 14, top: 116, transform: [{ rotate: '-15deg' }] },
  tickRightTop: { right: 22, top: 92, transform: [{ rotate: '-45deg' }] },
  tickRightBottom: { right: 14, top: 116, transform: [{ rotate: '15deg' }] },
  phasePill: {
    alignItems: 'center',
    backgroundColor: BRAND.orange,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  phaseText: {
    color: BRAND.midnightBlue,
    fontSize: 18,
    fontWeight: '800',
  },
  time: {
    color: BRAND.white,
    fontSize: 76,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    includeFontPadding: false,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  status: {
    color: BRAND.white,
    fontSize: 16,
  },
  divider: {
    alignSelf: 'stretch',
    backgroundColor: BRAND.softWhite,
    height: 1,
  },
});
