import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const orderItemsSchema = z.array(z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().min(1),
})).min(1, 'Cart must not be empty');

export const createOrderSchema = z.object({
  items: orderItemsSchema,
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  contactPhone: z.string().min(5, 'Phone number is required'),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'cod']).optional().default('bkash'),
  promoCode: z.string().trim().max(30).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(30).transform((s) => s.trim().toUpperCase()),
  items: orderItemsSchema,
});

const couponFields = z.object({
  code: z.string().min(1, 'Code is required').max(30).transform((s) => s.trim().toUpperCase()),
  discountType: z.enum(['fixed', 'percent']),
  value: z.number().int().min(1, 'Value must be at least 1'),
  minOrderAmount: z.number().int().min(0, 'Minimum order must be 0 or more').optional(),
  maxDiscount: z.number().int().min(0, 'Max discount must be 0 or more').optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  usageLimit: z.number().int().min(0, 'Usage limit must be 0 or more').optional(),
  perUserLimit: z.number().int().min(0, 'Per-user limit must be 0 or more').optional(),
  active: z.boolean().optional(),
});

const couponPercentRule = (data) => data.discountType !== 'percent' || data.value <= 100;
const couponPercentRuleOpts = { message: 'Percent value must be 100 or fewer', path: ['value'] };

export const couponSchema = couponFields.refine(couponPercentRule, couponPercentRuleOpts);
export const updateCouponSchema = couponFields.partial().refine(couponPercentRule, couponPercentRuleOpts);

export const updateStatusSchema = z.object({
  status: z.enum(['pending_payment', 'awaiting_confirmation', 'paid', 'shipped', 'fulfilled', 'cancelled']),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50).optional(),
  phone: z.string().max(20, 'Phone number must be at most 20 characters').optional(),
  notificationPrefs: z.object({
    orderUpdates: z.boolean().optional(),
    newDrops: z.boolean().optional(),
  }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const wishlistSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(30),
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().min(5, 'Phone number is required').max(20),
  line1: z.string().min(3, 'Address is required').max(120),
  line2: z.string().max(120).optional().default(''),
  city: z.string().min(2, 'City is required').max(60),
  region: z.string().max(60).optional().default(''),
  postal: z.string().max(20).optional().default(''),
  country: z.string().max(40).optional().default('Bangladesh'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressSchema.partial();

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().int().min(1, 'Price must be at least 1'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  sizes: z.array(z.string().min(1)).min(1, 'At least one size is required'),
  sizeGuideNote: z.string().max(500).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  stock: z.array(z.object({
    size: z.string(),
    inStock: z.boolean(),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ errors });
    }
    req.body = result.data;
    next();
  };
}
