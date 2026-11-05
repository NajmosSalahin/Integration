import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTrustProxy } from '../utils/trustProxy.js';

test('proxy headers are not trusted by default', () => {
  assert.equal(parseTrustProxy(undefined), false);
  assert.equal(parseTrustProxy(''), false);
  assert.equal(parseTrustProxy('0'), false);
});

test('an explicit hop count is trusted', () => {
  assert.equal(parseTrustProxy('1'), 1);
  assert.equal(parseTrustProxy('2'), 2);
});

test('invalid hop counts are rejected', () => {
  assert.throws(() => parseTrustProxy('true'), /TRUST_PROXY_HOPS/);
  assert.throws(() => parseTrustProxy('-1'), /TRUST_PROXY_HOPS/);
  assert.throws(() => parseTrustProxy('1.5'), /TRUST_PROXY_HOPS/);
});
