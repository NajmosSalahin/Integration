import test from 'node:test';
import assert from 'node:assert/strict';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createOrderSchema,
  validateCouponSchema,
  couponSchema,
  updateStatusSchema,
  updateProfileSchema,
  changePasswordSchema,
  wishlistSchema,
  addressSchema,
  updateAddressSchema,
  createProductSchema,
  updateProductSchema,
  setActiveSchema,
  setFeaturedSchema,
  setHomeCollectionSchema,
  bannerSchema,
  updateBannerSchema,
  categorySchema,
  updateCategorySchema,
  contactSchema,
  newsletterSchema,
} from '../utils/validate.js';

test('all request schemas accept representative valid payloads', () => {
  signupSchema.parse({ name: 'Test User', email: 'test@example.com', password: 'Password1', confirmPassword: 'Password1' });
  loginSchema.parse({ email: 'test@example.com', password: 'Password1' });
  forgotPasswordSchema.parse({ email: 'test@example.com' });
  resetPasswordSchema.parse({ token: 'token', password: 'Password1', confirmPassword: 'Password1' });
  createOrderSchema.parse({
    items: [{ productId: 'product-1', size: 'M', quantity: 1 }],
    deliveryAddress: '123 Test Street',
    contactPhone: '+8801700000000',
    paymentMethod: 'cod',
    promoCode: 'SAVE10',
  });
  validateCouponSchema.parse({ code: ' save10 ', items: [{ productId: 'product-1', size: 'M', quantity: 1 }] });
  couponSchema.parse({
    code: 'SAVE10',
    discountType: 'percent',
    value: 10,
    expiresAt: '2027-01-01T00:00:00.000Z',
  });
  updateStatusSchema.parse({ status: 'paid' });
  updateProfileSchema.parse({ name: 'Test User', phone: '+8801700000000' });
  changePasswordSchema.parse({ currentPassword: 'Password1', newPassword: 'Password2', confirmPassword: 'Password2' });
  wishlistSchema.parse({ productId: 'product-1' });
  addressSchema.parse({
    label: 'Home',
    name: 'Test User',
    phone: '+8801700000000',
    line1: '123 Test Street',
    city: 'Dhaka',
  });
  updateAddressSchema.parse({ city: 'Chattogram' });
  createProductSchema.parse({
    title: 'Test Tee',
    description: 'A long enough product description.',
    price: 1200,
    images: ['https://example.com/image.jpg'],
    sizes: ['S', 'M'],
  });
  updateProductSchema.parse({ price: 1500 });
  setActiveSchema.parse({ active: true });
  setFeaturedSchema.parse({ featured: true });
  setHomeCollectionSchema.parse({ homeCollection: true });
  bannerSchema.parse({ publicId: 'banner-1' });
  updateBannerSchema.parse({ active: false });
  categorySchema.parse({ name: 'Tees', tag: 'Tees & Tops', group: 'Apparel' });
  updateCategorySchema.parse({ active: false });
  contactSchema.parse({ name: 'Test User', email: 'test@example.com', message: 'This message is long enough.' });
  newsletterSchema.parse({ email: 'test@example.com' });
});

test('invalid values are still rejected after the Zod upgrade', () => {
  assert.equal(signupSchema.safeParse({ name: 'A', email: 'not-an-email', password: 'weak', confirmPassword: 'weak' }).success, false);
  assert.equal(createOrderSchema.safeParse({ items: [], deliveryAddress: 'x', contactPhone: '1' }).success, false);
  assert.equal(couponSchema.safeParse({ code: 'SAVE10', discountType: 'percent', value: 101 }).success, false);
  assert.equal(createProductSchema.safeParse({
    title: 'Test Tee',
    description: 'A long enough product description.',
    price: 1200,
    images: ['not-a-url'],
    sizes: ['S'],
  }).success, false);
  assert.equal(setHomeCollectionSchema.safeParse({}).success, false);
});
