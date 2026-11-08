import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { APP_VERSION, healthPayload } from '../utils/health.js';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

test('health payload reports the server package version', () => {
  assert.deepEqual(healthPayload(), {
    status: 'ok',
    version: packageJson.version,
  });
  assert.equal(APP_VERSION, packageJson.version);
  assert.match(APP_VERSION, /^\d+\.\d+\.\d+$/);
});
