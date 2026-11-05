import test from 'node:test';
import assert from 'node:assert/strict';
import multer from 'multer';
import { validateObjectId } from '../middleware/validateObjectId.js';
import errorHandler from '../middleware/errorHandler.js';

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

test('valid ObjectIds reach the next handler', () => {
  let called = false;
  const res = createResponse();
  validateObjectId('id')({ params: { id: '507f1f77bcf86cd799439011' } }, res, () => {
    called = true;
  });
  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});

test('invalid ObjectIds return 400', () => {
  let called = false;
  const res = createResponse();
  validateObjectId('id')({ params: { id: 'not-an-id' } }, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Invalid id' });
});

test('every guarded parameter is checked', () => {
  const res = createResponse();
  validateObjectId('id', 'other')({ params: { id: '507f1f77bcf86cd799439011', other: 'x' } }, res, () => {});
  assert.equal(res.statusCode, 400);
});

test('malformed JSON maps to 400', () => {
  const res = createResponse();
  const err = Object.assign(new SyntaxError('Unexpected token'), {
    type: 'entity.parse.failed',
    status: 400,
  });
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Invalid JSON' });
});

test('oversized bodies map to 413', () => {
  const res = createResponse();
  const err = Object.assign(new Error('too large'), {
    type: 'entity.too.large',
    status: 413,
  });
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 413);
  assert.deepEqual(res.body, { error: 'Request body too large' });
});

test('multer errors keep their 400 response', () => {
  const res = createResponse();
  errorHandler(new multer.MulterError('LIMIT_FILE_SIZE'), {}, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Image upload failed - max 5 MB allowed' });
});

test('unknown errors return 500 without leaking details', () => {
  const res = createResponse();
  const originalError = console.error;
  console.error = () => {};
  try {
    errorHandler(new Error('secret detail'), {}, res, () => {});
  } finally {
    console.error = originalError;
  }
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Something went wrong' });
});
