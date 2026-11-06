import test from 'node:test';
import assert from 'node:assert/strict';
import { requireVerifiedEmail } from '../middleware/requireVerifiedEmail.js';

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('unverified users cannot place an order', () => {
  let called = false;
  const res = createResponse();
  requireVerifiedEmail({ user: { emailVerified: false } }, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    error: 'Please verify your email before placing an order',
    code: 'EMAIL_NOT_VERIFIED',
  });
});

test('missing users cannot place an order', () => {
  let called = false;
  const res = createResponse();
  requireVerifiedEmail({}, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
});

test('verified users continue to order creation', () => {
  let called = false;
  const res = createResponse();
  requireVerifiedEmail({ user: { emailVerified: true } }, res, () => {
    called = true;
  });
  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});
