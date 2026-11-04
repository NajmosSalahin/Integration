import test from 'node:test';
import assert from 'node:assert/strict';
import { createCouponReservationStore } from '../utils/couponReservation.js';

function exprMatches(coupon, expr) {
  if (!expr) return true;

  const resolve = (value) => (
    typeof value === 'string' && value.startsWith('$') ? coupon[value.slice(1)] : value
  );

  return (expr.$or || []).some((condition) => {
    if (condition.$eq) {
      const [field, value] = condition.$eq;
      return resolve(field) === value;
    }
    if (condition.$lt) {
      const [left, right] = condition.$lt;
      return resolve(left) < resolve(right);
    }
    return false;
  });
}

function createFakeCouponModel(coupon) {
  return {
    async findOneAndUpdate(filter, update) {
      if (!exprMatches(coupon, filter.$expr)) {
        return null;
      }
      coupon.timesUsed += update.$inc.timesUsed;
      return { ...coupon };
    },
    async updateOne(filter, update) {
      if (filter.timesUsed?.$gt !== undefined && coupon.timesUsed <= filter.timesUsed.$gt) {
        return { modifiedCount: 0 };
      }
      coupon.timesUsed += update.$inc.timesUsed;
      return { modifiedCount: 1 };
    },
  };
}

function createFakeRedemptionModel() {
  const records = new Map();
  const key = (couponId, userId) => `${couponId}:${userId}`;

  return {
    records,
    async findOne(filter) {
      return records.get(key(filter.couponId, filter.userId)) || null;
    },
    async create(doc) {
      const recordKey = key(doc.couponId, doc.userId);
      if (records.has(recordKey)) {
        const err = new Error('duplicate key');
        err.code = 11000;
        throw err;
      }
      const record = { ...doc };
      records.set(recordKey, record);
      return record;
    },
    async findOneAndUpdate(filter, update) {
      const record = records.get(key(filter.couponId, filter.userId));
      if (!record) return null;
      if (filter.count?.$lt !== undefined && record.count >= filter.count.$lt) {
        return null;
      }
      record.count += update.$inc.count;
      return record;
    },
    async updateOne(filter, update) {
      const record = records.get(key(filter.couponId, filter.userId));
      if (!record) return { modifiedCount: 0 };
      if (filter.count?.$gt !== undefined && record.count <= filter.count.$gt) {
        return { modifiedCount: 0 };
      }
      record.count += update.$inc.count;
      return { modifiedCount: 1 };
    },
  };
}

function createFakeOrderModel() {
  return {
    historicalCount: 0,
    async countDocuments() {
      return this.historicalCount;
    },
  };
}

function createStore(coupon, options = {}) {
  const CouponModel = createFakeCouponModel(coupon);
  const RedemptionModel = createFakeRedemptionModel();
  const OrderModel = createFakeOrderModel();
  OrderModel.historicalCount = options.historicalCount || 0;
  const store = createCouponReservationStore({ CouponModel, RedemptionModel, OrderModel });
  return { store, CouponModel, RedemptionModel, OrderModel };
}

const userA = 'user-a';
const userB = 'user-b';

function makeCoupon(overrides = {}) {
  return {
    _id: 'coupon-1',
    code: 'SAVE10',
    usageLimit: 0,
    perUserLimit: 0,
    timesUsed: 0,
    ...overrides,
  };
}

test('global usage is reserved atomically before the order is created', async () => {
  const coupon = makeCoupon({ usageLimit: 1 });
  const { store } = createStore(coupon);

  assert.deepEqual(await store.reserve(coupon, userA), { ok: true });
  assert.equal(coupon.timesUsed, 1);
  assert.deepEqual(await store.reserve(coupon, userB), { ok: false, reason: 'usage-exceeded' });
  assert.equal(coupon.timesUsed, 1);
});

test('per-user limits roll back the global usage increment when exceeded', async () => {
  const coupon = makeCoupon({ perUserLimit: 1 });
  const { store, RedemptionModel } = createStore(coupon);

  assert.deepEqual(await store.reserve(coupon, userA), { ok: true });
  assert.equal(coupon.timesUsed, 1);
  assert.equal(RedemptionModel.records.get('coupon-1:user-a').count, 1);

  assert.deepEqual(await store.reserve(coupon, userA), { ok: false, reason: 'per-user-exceeded' });
  assert.equal(coupon.timesUsed, 1);
  assert.equal(RedemptionModel.records.get('coupon-1:user-a').count, 1);
});

test('releasing a reservation restores both counters', async () => {
  const coupon = makeCoupon({ usageLimit: 5, perUserLimit: 5 });
  const { store, RedemptionModel } = createStore(coupon);

  await store.reserve(coupon, userA);
  await store.release(coupon, userA);

  assert.equal(coupon.timesUsed, 0);
  assert.equal(RedemptionModel.records.get('coupon-1:user-a').count, 0);
  assert.deepEqual(await store.reserve(coupon, userA), { ok: true });
});

test('existing orders count toward the per-user limit', async () => {
  const coupon = makeCoupon({ perUserLimit: 2 });
  const { store, RedemptionModel } = createStore(coupon, { historicalCount: 1 });

  assert.deepEqual(await store.reserve(coupon, userA), { ok: true });
  assert.equal(RedemptionModel.records.get('coupon-1:user-a').count, 2);

  assert.deepEqual(await store.reserve(coupon, userA), { ok: false, reason: 'per-user-exceeded' });
  assert.equal(coupon.timesUsed, 1);
});

test('unlimited coupons still track per-user usage for later limit changes', async () => {
  const coupon = makeCoupon();
  const { store, RedemptionModel } = createStore(coupon);

  assert.deepEqual(await store.reserve(coupon, userA), { ok: true });
  assert.deepEqual(await store.reserve(coupon, userA), { ok: true });
  assert.equal(RedemptionModel.records.get('coupon-1:user-a').count, 2);
  assert.equal(coupon.timesUsed, 2);
});
