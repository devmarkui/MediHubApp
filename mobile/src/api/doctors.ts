import { get } from './client';

import type { Doctor, Slot } from '@/types/models';

export const doctorsApi = {
  list() {
    return get<Doctor[]>('/doctors');
  },
  show(slug: string) {
    return get<Doctor>(`/doctors/${slug}`);
  },
  slots(doctorId: number, date: string) {
    return get<{ slots: Slot[] }>(`/doctors/${doctorId}/available-slots`, { date });
  },
};
