import { get, post } from './client';

import type { Patient } from '@/types/models';

export const authApi = {
  requestOtp(phone: string) {
    return post<{ otp_id: number }>('/auth/request-otp', { phone });
  },
  verifyOtp(phone: string, otpId: number, code: string) {
    return post<{ token: string | null; patient: Patient | null; is_new: boolean }>(
      '/auth/verify-otp',
      { phone, otp_id: otpId, code },
    );
  },
  register(payload: {
    phone: string;
    otp_id: number;
    code: string;
    name: string;
    email?: string;
    dob?: string;
    gender?: 'male' | 'female' | 'other';
  }) {
    return post<{ token: string; patient: Patient }>('/auth/register', payload);
  },
  logout() {
    return post<null>('/auth/logout');
  },
  me() {
    return get<Patient>('/auth/me');
  },
};
