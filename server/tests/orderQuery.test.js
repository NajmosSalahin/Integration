import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOrderQuery, ORDER_STATUSES } from '../utils/orderQuery.js';

test('order queries default to page 1 and 20 results', () => {
  assert.deepEqual(parseOrderQuery({}), { status: undefined, search: undefined, sort: undefined, page: 1, limit: 20 });
});

test('valid filters and pagination are parsed', () => {
  assert.deepEqual(
    parseOrderQuery({ status: 'paid', page: '2', limit: '50', search: 'audit', sort: 'date_asc' }),
    { status: 'paid', search: 'audit', sort: 'date_asc', page: 2, limit: 50 }
  );
});

test('every documented order status is accepted', () => {
  for (const status of ORDER_STATUSES) {
    assert.equal(parseOrderQuery({ status }).status, status);
  }
});

test('query operators and unknown statuses are rejected', () => {
  assert.equal(parseOrderQuery({ status: { $ne: 'fulfilled' } }).error, 'Invalid status filter');
  assert.equal(parseOrderQuery({ status: ['paid'] }).error, 'Invalid status filter');
  assert.equal(parseOrderQuery({ status: 'nonexistent' }).error, 'Invalid status filter');
});

test('invalid pagination is rejected', () => {
  assert.equal(parseOrderQuery({ page: '0' }).error, 'Page must be a positive integer');
  assert.equal(parseOrderQuery({ page: '-5' }).error, 'Page must be a positive integer');
  assert.equal(parseOrderQuery({ page: '1.5' }).error, 'Page must be a positive integer');
  assert.equal(parseOrderQuery({ limit: '0' }).error, 'Limit must be between 1 and 100');
  assert.equal(parseOrderQuery({ limit: '101' }).error, 'Limit must be between 1 and 100');
  assert.equal(parseOrderQuery({ limit: 'abc' }).error, 'Limit must be between 1 and 100');
});

test('object-valued search and sort parameters are rejected', () => {
  assert.equal(parseOrderQuery({ search: { $ne: '' } }).error, 'Invalid search query');
  assert.equal(parseOrderQuery({ sort: { $ne: '' } }).error, 'Invalid sort value');
});
