import { z } from 'zod';

// Local 9-digit form: 7XXXXXXXX (without +94)
const localPhoneRegex = /^7\d{8}$/;
export const localPhoneSchema = z
  .string()
  .min(9)
  .max(9)
  .regex(localPhoneRegex, 'Enter a valid mobile number');

export const otpSchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(120),
  email: z.string().email('Enter a valid email').or(z.literal('')).optional(),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

// Stage 1 — password login + self sign-up.
export const loginSchema = z.object({
  password: z.string().min(1, 'Enter your password'),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name is too short').max(120),
    password: z.string().min(6, 'At least 6 characters').max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Stage 2 — optional BMI basics.
const heightField = z
  .string()
  .optional()
  .refine((v) => !v || (Number(v) >= 30 && Number(v) <= 300), 'Enter a valid height in cm');
const weightField = z
  .string()
  .optional()
  .refine((v) => !v || (Number(v) >= 1 && Number(v) <= 500), 'Enter a valid weight in kg');

export const healthSchema = z.object({
  height_cm: heightField,
  weight_kg: weightField,
});

const dobField = z
  .string()
  .optional()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Use the format YYYY-MM-DD');

export const profileSchema = z.object({
  name: z.string().min(2).max(120),
  nic: z.string().max(20).or(z.literal('')).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  address: z.string().max(255).or(z.literal('')).optional(),
  district: z.string().max(60).or(z.literal('')).optional(),
  postal_code: z.string().max(10).or(z.literal('')).optional(),
  dob: dobField,
  gender: z.enum(['male', 'female', 'other']).optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  height_cm: heightField,
  weight_kg: weightField,
});

export const familyMemberSchema = z.object({
  name: z.string().min(2).max(120),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

export function toE164(local9: string): string {
  return `+94${local9}`;
}
