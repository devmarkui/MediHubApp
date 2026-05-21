import { get, post } from './client';

import type { Notification } from '@/types/models';

export const notificationsApi = {
  list(opts: { unread?: boolean } = {}) {
    return get<Notification[]>('/notifications', opts.unread ? { unread: 1 } : undefined);
  },
  markRead(id: number) {
    return post<Notification>(`/notifications/${id}/read`);
  },
  readAll() {
    return post<null>('/notifications/read-all');
  },
};
