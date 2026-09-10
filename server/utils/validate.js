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

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    size: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1, 'Cart must not be empty'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  contactPhone: z.string().min(5, 'Phone number is required'),
  paymentMethod: z.enum(['bkash', 'cod']).optional().default('bkash'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending_payment', 'awaiting_confirmation', 'paid', 'fulfilled', 'cancelled']),
});

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().int().min(1, 'Price must be at least 1'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  sizes: z.array(z.string().min(1)).min(1, 'At least one size is required'),
  sizeGuideNote: z.string().max(500).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
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
