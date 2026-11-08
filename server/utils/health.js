import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

export const APP_VERSION = packageJson.version;

export function healthPayload() {
  return { status: 'ok', version: APP_VERSION };
}
