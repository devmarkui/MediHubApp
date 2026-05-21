import { get } from './client';

import type { AppConfig } from '@/types/models';

export const appApi = {
  config() {
    return get<AppConfig>('/app/config');
  },
};
