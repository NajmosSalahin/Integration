import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  canTransition,
} from '../utils/orderStatus.js';

const ALLOWED = {
  pending_payment: ['paid', 'cancelled'],
  awaiting_confirmation: ['paid', 'shipped', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['fulfilled'],
  fulfilled: [],
  cancelled: [],
};

test('documented transitions are allowed', () => {
  for (const [from, targets] of Object.entries(ALLOWED)) {
    for (const to of targets) {
      assert.equal(canTransition(from, to), true, `${from} should transition to ${to}`);
    }
  }
});

test('every other transition is rejected', () => {
  for (const from of ORDER_STATUSES) {
    for (const to of ORDER_STATUSES) {
      const expected = ALLOWED[from].includes(to);
      assert.equal(canTransition(from, to), expected, `${from} -> ${to}`);
    }
  }
});

test('changing to the same status is not a transition', () => {
  for (const status of ORDER_STATUSES) {
    assert.equal(canTransition(status, status), false);
  }
});

test('fulfilled and cancelled are terminal', () => {
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.fulfilled, []);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.cancelled, []);
});

test('unknown statuses have no transitions', () => {
  assert.equal(canTransition('unknown', 'paid'), false);
  assert.equal(canTransition('paid', 'unknown'), false);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.unknown, undefined);
  assert.equal(ORDER_STATUS_TRANSITIONS.paid.includes('shipped'), true);
});
