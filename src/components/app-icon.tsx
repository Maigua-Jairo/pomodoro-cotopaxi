import type { ComponentProps } from 'react';
import { Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

type SymbolName = Exclude<ComponentProps<typeof SymbolView>['name'], string>;

const ICONS = {
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause', web: 'pause' },
  restart: { ios: 'arrow.clockwise', android: 'restart_alt', web: 'restart_alt' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  target: { ios: 'target', android: 'track_changes', web: 'track_changes' },
  brain: { ios: 'brain.head.profile', android: 'psychology', web: 'psychology' },
  group: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
  school: { ios: 'graduationcap.fill', android: 'school', web: 'school' },
  coffee: { ios: 'cup.and.saucer.fill', android: 'coffee', web: 'coffee' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  mountain: { ios: 'mountain.2.fill', android: 'landscape', web: 'landscape' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  info: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  shield: { ios: 'checkmark.shield.fill', android: 'shield', web: 'shield' },
  sofa: { ios: 'sofa.fill', android: 'weekend', web: 'weekend' },
  cycle: { ios: 'arrow.triangle.2.circlepath', android: 'autorenew', web: 'autorenew' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  save: { ios: 'square.and.arrow.down.fill', android: 'save', web: 'save' },
} satisfies Record<string, SymbolName>;

export type AppIconName = keyof typeof ICONS;

interface AppIconProps {
  name: AppIconName;
  color: string;
  size?: number;
}

export function AppIcon({ name, color, size = 24 }: AppIconProps) {
  return (
    <SymbolView
      accessible={false}
      fallback={<Text style={{ color, fontSize: size * 0.8 }}>•</Text>}
      name={ICONS[name]}
      size={size}
      tintColor={color}
    />
  );
}
