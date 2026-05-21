import { get, post } from './client';

import type { Appointment } from '@/types/models';

export const appointmentsApi = {
  list(status: 'upcoming' | 'past' | 'all' = 'all') {
    return get<Appointment[]>('/appointments', { status });
  },
  show(id: number) {
    return get<Appointment>(`/appointments/${id}`);
  },
  create(payload: { doctor_id: number; date: string; time: string; notes?: string }) {
    return post<Appointment>('/appointments', payload);
  },
  cancel(id: number) {
    return post<Appointment>(`/appointments/${id}/cancel`);
  },
};
