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

export const profileSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().or(z.literal('')).optional(),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
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
