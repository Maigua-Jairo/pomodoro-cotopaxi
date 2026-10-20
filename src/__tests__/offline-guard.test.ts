import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

import packageJson from '../../package.json';

const SRC_DIR = join(__dirname, '..');
const NETWORK_APIS = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /\bopenBrowserAsync\b/,
  /\bLinking\.openURL\b/,
];
const FORBIDDEN_PACKAGES =
  /admob|(^|[-/])ads?([-/]|$)|analytics|firebase|sentry|amplitude|mixpanel|segment|appsflyer|facebook|tracking-transparency/i;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return entry === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.tsx?$/.test(entry) ? [path] : [];
  });
}

describe('offline and ad-free guard', () => {
  it('does not use network APIs in the app source', () => {
    const offenders = sourceFiles(SRC_DIR).flatMap((file) => {
      const content = readFileSync(file, 'utf8');
      return NETWORK_APIS.filter((pattern) => pattern.test(content)).map(
        (pattern) => `${relative(SRC_DIR, file)}: ${pattern}`,
      );
    });

    expect(offenders).toEqual([]);
  });

  it('does not depend on advertising, analytics or tracking packages', () => {
    const dependencies = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    });

    expect(dependencies.filter((name) => FORBIDDEN_PACKAGES.test(name))).toEqual([]);
  });
});
