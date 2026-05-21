import { get, post } from './client';

import type { LabOrder, LabTest } from '@/types/models';

export const labTestsApi = {
  list(category?: string) {
    return get<LabTest[]>('/lab-tests', category ? { category } : undefined);
  },
  orders(status?: string) {
    return get<LabOrder[]>('/lab-orders', status ? { status } : undefined);
  },
  showOrder(id: number) {
    return get<LabOrder>(`/lab-orders/${id}`);
  },
  createOrder(payload: { test_ids: number[]; collection_type: 'walk_in' | 'home' }) {
    return post<LabOrder>('/lab-orders', payload);
  },
};
