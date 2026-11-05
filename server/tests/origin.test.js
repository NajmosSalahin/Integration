import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAllowedOrigins, isAllowedOrigin } from '../utils/origin.js';

test('a single client URL is the only allowed browser origin', () => {
  const origins = parseAllowedOrigins('https://integration.example.com');

  assert.equal(isAllowedOrigin('https://integration.example.com', origins), true);
  assert.equal(isAllowedOrigin('https://evil.onrender.com', origins), false);
  assert.equal(isAllowedOrigin('https://integration-06n2.onrender.com', origins), false);
});

test('comma-separated client URLs are supported', () => {
  const origins = parseAllowedOrigins('https://one.example.com, https://two.example.com');

  assert.deepEqual(origins, ['https://one.example.com', 'https://two.example.com']);
  assert.equal(isAllowedOrigin('https://two.example.com', origins), true);
  assert.equal(isAllowedOrigin('https://three.example.com', origins), false);
});

test('requests without an Origin header are allowed', () => {
  assert.equal(isAllowedOrigin(undefined, ['https://integration.example.com']), true);
  assert.equal(isAllowedOrigin('', ['https://integration.example.com']), true);
});

test('blank entries are ignored', () => {
  assert.deepEqual(parseAllowedOrigins(' , https://one.example.com, '), ['https://one.example.com']);
});
