import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { DUMMY_PASSWORD_HASH, verifyLoginPassword } from '../utils/loginPassword.js';

test('the dummy hash uses the same bcrypt cost as real passwords', () => {
  assert.equal(bcrypt.getRounds(DUMMY_PASSWORD_HASH), 12);
  assert.equal(bcrypt.compareSync('not-a-real-password', DUMMY_PASSWORD_HASH), true);
  assert.equal(bcrypt.compareSync('some-other-password', DUMMY_PASSWORD_HASH), false);
});

test('missing users still run a bcrypt comparison and fail', async () => {
  assert.equal(await verifyLoginPassword(null, 'wrong-password'), false);
});

test('existing users compare against their stored hash', async () => {
  const user = {
    comparePassword: async (password) => password === 'correct-password',
  };

  assert.equal(await verifyLoginPassword(user, 'correct-password'), true);
  assert.equal(await verifyLoginPassword(user, 'wrong-password'), false);
});
