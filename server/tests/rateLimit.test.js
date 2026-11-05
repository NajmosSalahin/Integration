import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = fileURLToPath(new URL('..', import.meta.url));

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForHealth(port, getLogs) {
  const hosts = ['localhost', '[::1]', '127.0.0.1'];

  for (let attempt = 0; attempt < 300; attempt += 1) {
    for (const host of hosts) {
      try {
        const response = await fetch(`http://${host}:${port}/api/health`);
        if (response.ok) {
          return `http://${host}:${port}`;
        }
      } catch {
        // server is still starting
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`server did not become healthy\n${getLogs()}`);
}

test('rotating X-Forwarded-For does not reset the contact limiter', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'integration-rate-'));
  const envFile = join(dir, '.env.test');
  writeFileSync(envFile, 'JWT_SECRET=test-access-secret\nJWT_REFRESH_SECRET=test-refresh-secret\n');

  const port = await getFreePort();
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    ENV_FILE: envFile,
    PORT: String(port),
    MONGO_URI: '',
    BREVO_API_KEY: '',
    OWNER_EMAIL: '',
  };
  delete env.JWT_SECRET;
  delete env.JWT_REFRESH_SECRET;
  delete env.TRUST_PROXY_HOPS;

  const child = spawn(process.execPath, ['server.js'], {
    cwd: serverDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let logs = '';
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });

  t.after(() => {
    child.kill();
    rmSync(dir, { recursive: true, force: true });
  });

  const baseUrl = await waitForHealth(port, () => logs);

  const statuses = [];
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': `10.1.1.${attempt}`,
      },
      body: JSON.stringify({
        name: 'Audit Test',
        email: 'audit@example.com',
        message: 'This is a valid contact message for the rate limit test.',
      }),
    });
    statuses.push(response.status);
    await response.text();
  }

  assert.deepEqual(statuses.slice(0, 5), [200, 200, 200, 200, 200], logs);
  assert.equal(statuses[5], 429, logs);
});
