import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BRAND } from '@/constants/brand';

export function ScreenFooter({
  message,
  icon = 'mountain',
}: {
  message: string;
  icon?: AppIconName;
}) {
  return (
    <View style={styles.footer}>
      <View pointerEvents="none" style={styles.blobOrange} />
      <View pointerEvents="none" style={styles.blobBlue} />
      <View style={styles.hintBlock}>
        <Text style={styles.hint}>{message}</Text>
        <View style={styles.hintUnderline} />
      </View>
      <View style={styles.mountain}>
        <AppIcon color={BRAND.midnightBlue} name={icon} size={44} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 96,
    paddingHorizontal: 24,
  },
  blobOrange: {
    backgroundColor: BRAND.orange,
    borderRadius: 90,
    bottom: -100,
    height: 180,
    left: -90,
    position: 'absolute',
    width: 180,
  },
  blobBlue: {
    backgroundColor: BRAND.midnightBlue,
    borderRadius: 80,
    bottom: -120,
    height: 160,
    left: -50,
    position: 'absolute',
    width: 160,
  },
  hintBlock: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    paddingLeft: 56,
  },
  hint: {
    color: BRAND.midnightBlue,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  hintUnderline: {
    backgroundColor: BRAND.orange,
    borderRadius: 2,
    height: 3,
    width: 140,
  },
  mountain: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
