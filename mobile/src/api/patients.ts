import { http, get, put, post, del } from './client';

import type { Patient } from '@/types/models';
import type { ApiEnvelope } from '@/types/api';

export const patientsApi = {
  me() {
    return get<Patient>('/patients/me');
  },
  update(
    payload: Partial<
      Pick<
        Patient,
        'name' | 'email' | 'dob' | 'gender' | 'blood_group' | 'height_cm' | 'weight_kg' | 'language'
      >
    >,
  ) {
    return put<Patient>('/patients/me', payload);
  },
  registerPushToken(token: string) {
    return post<null>('/patients/me/push-token', { expo_push_token: token });
  },
  async uploadAvatar(uri: string): Promise<Patient> {
    const form = new FormData();
    const filename = uri.split('/').pop() ?? 'avatar.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    form.append('avatar', {
      uri,
      name: filename,
      type: mime,
    } as unknown as Blob);

    const r = await http.post<ApiEnvelope<Patient>>('/patients/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data.data;
  },
  listFamily() {
    return get<Patient[]>('/patients/me/family');
  },
  addFamily(payload: Pick<Patient, 'name'> & Partial<Pick<Patient, 'dob' | 'gender' | 'blood_group'>>) {
    return post<Patient>('/patients/me/family', payload);
  },
  updateFamily(id: number, payload: Partial<Patient>) {
    return put<Patient>(`/patients/me/family/${id}`, payload);
  },
  deleteFamily(id: number) {
    return del<null>(`/patients/me/family/${id}`);
  },
};
