import { describe, expect, it } from '@jest/globals';

import appJson from '../../app.json';

interface AppConfig {
  expo: {
    android?: { allowBackup?: boolean; blockedPermissions?: string[] };
    ios?: { infoPlist?: Record<string, unknown> };
    updates?: { url?: string };
  };
}

const { expo } = appJson as AppConfig;

describe('offline app configuration', () => {
  it('disables Android backups so a reinstall starts from scratch', () => {
    expect(expo.android?.allowBackup).toBe(false);
  });

  it('blocks Android permissions the app does not need', () => {
    expect(expo.android?.blockedPermissions).toEqual(
      expect.arrayContaining([
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
      ]),
    );
  });

  it('does not download updates over the internet', () => {
    expect(expo.updates?.url).toBeUndefined();
  });

  it('does not declare iOS usage descriptions for extra permissions', () => {
    const keys = Object.keys(expo.ios?.infoPlist ?? {});
    expect(keys.filter((key) => key.endsWith('UsageDescription'))).toEqual([]);
  });
});
