import { get } from './client';

import type { Report, ReportType } from '@/types/models';

export const reportsApi = {
  list(type?: ReportType) {
    return get<Report[]>('/reports', type ? { type } : undefined);
  },
  show(id: number) {
    return get<Report>(`/reports/${id}`);
  },
  downloadUrl(id: number) {
    return get<{ url: string; expires_at: string }>(`/reports/${id}/download-url`);
  },
};
