import { get, post } from './client';

import type { Payment } from '@/types/models';

export type PaymentInitiateResponse = {
  payment: Payment;
  checkout_url: string;
  params: Record<string, string>;
};

export const paymentsApi = {
  initiate(payload: { payable_type: 'appointment' | 'lab_order' | 'package_purchase'; payable_id: number }) {
    return post<PaymentInitiateResponse>('/payments/initiate', payload);
  },
  show(id: number) {
    return get<Payment>(`/payments/${id}`);
  },
};
