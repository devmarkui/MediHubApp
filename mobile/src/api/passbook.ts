import { get } from './client';

import type { PassbookEntry } from '@/types/models';

export type PassbookType = 'all' | 'lab' | 'consultation' | 'package';

export type PassbookPage = {
  items: PassbookEntry[];
  meta: {
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
  };
};

export const passbookApi = {
  feed(params: { type?: PassbookType; page?: number; per_page?: number } = {}) {
    return get<PassbookPage>('/passbook', params);
  },
};
