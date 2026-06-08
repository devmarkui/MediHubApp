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

// Parse a date-only `yyyy-MM-dd` string into a local Date (null if malformed).
function parseDob(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function ageInYears(d: Date): number {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

// Required DOB: not empty, a real date, not in the future, at most 120 years
// old. Refinements are ordered so the most specific message surfaces first.
export const dobSchema = z
  .string({ required_error: 'Please select date of birth' })
  .min(1, 'Please select date of birth')
  .refine((v) => parseDob(v) !== null, 'Please enter a valid date of birth')
  .refine((v) => {
    const d = parseDob(v);
    if (!d) return true; // earlier refine reports the format error
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return d.getTime() <= todayEnd.getTime();
  }, 'Date of birth cannot be in the future')
  .refine((v) => {
    const d = parseDob(v);
    if (!d) return true;
    const age = ageInYears(d);
    return age >= 0 && age <= 120;
  }, 'Please enter a valid date of birth');

// Strong full-name rule set. Letters plus spaces, apostrophes and hyphens only;
// no numbers, no leading/trailing or doubled spaces. Ordered for clear messages.
export const fullNameSchema = z
  .string({ required_error: 'Please enter full name' })
  .refine((v) => v.trim().length > 0, 'Please enter full name')
  .refine((v) => v.trim().length >= 2, 'Name must be at least 2 characters')
  .refine((v) => v.trim().length <= 50, 'Please enter a valid full name')
  .refine((v) => !/\d/.test(v), 'Name cannot contain numbers')
  .refine((v) => /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(v.trim()), 'Please enter a valid full name')
  .refine((v) => !/\s{2,}/.test(v), 'Please enter a valid full name');

export const familyMemberSchema = z.object({
  name: fullNameSchema,
  dob: dobSchema,
  gender: z.enum(['male', 'female', 'other']).optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

export function toE164(local9: string): string {
  return `+94${local9}`;
}
