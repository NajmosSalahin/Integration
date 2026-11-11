import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRedirectTarget } from '../utils/redirect.js';

test('strips trailing slashes', () => {
  assert.equal(normalizeRedirectTarget('/shop/'), '/shop');
  assert.equal(normalizeRedirectTarget('/shop///'), '/shop');
});

test('keeps a single leading slash', () => {
  assert.equal(normalizeRedirectTarget('//evil.example/'), '/evil.example');
  assert.equal(normalizeRedirectTarget('///shop/'), '/shop');
});

test('collapses an empty path to the root', () => {
  assert.equal(normalizeRedirectTarget('/'), '/');
  assert.equal(normalizeRedirectTarget('///'), '/');
});

test('rejects backslashes and encoded separators', () => {
  assert.equal(normalizeRedirectTarget('/\\evil.example/'), null);
  assert.equal(normalizeRedirectTarget('/%5cevil.example/'), null);
  assert.equal(normalizeRedirectTarget('/%2fevil.example/'), null);
});
