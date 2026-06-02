import { get, post } from './client';

import type { Patient } from '@/types/models';

export const authApi = {
  // Stage 1 — sign in with mobile number + password.
  login(phone: string, password: string) {
    return post<{ token: string; patient: Patient }>('/auth/login', { phone, password });
  },
  // Stage 1 — self sign-up (password). OTP fields kept optional for later.
  register(payload: {
    phone: string;
    name: string;
    password: string;
    email?: string;
    dob?: string;
    gender?: 'male' | 'female' | 'other';
    height_cm?: number;
    weight_kg?: number;
    otp_id?: number;
    code?: string;
  }) {
    return post<{ token: string; patient: Patient }>('/auth/register', payload);
  },
  // OTP scaffolding — ready for when the SMS gateway is wired up.
  requestOtp(phone: string) {
    return post<{ otp_id: number }>('/auth/request-otp', { phone });
  },
  verifyOtp(phone: string, otpId: number, code: string) {
    return post<{ token: string | null; patient: Patient | null; is_new: boolean }>(
      '/auth/verify-otp',
      { phone, otp_id: otpId, code },
    );
  },
  logout() {
    return post<null>('/auth/logout');
  },
  me() {
    return get<Patient>('/auth/me');
  },
};
