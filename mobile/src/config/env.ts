export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.152:8000/api/v1',
  payhereMode: (process.env.EXPO_PUBLIC_PAYHERE_MODE ?? 'sandbox') as 'sandbox' | 'live',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
};
