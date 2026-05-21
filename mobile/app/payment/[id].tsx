import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import { paymentsApi } from '@/api/payments';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors, fontFamily, spacing } from '@/theme';
import { ApiError } from '@/types/api';

type Status = 'pending' | 'success' | 'failed' | 'cancelled';

export default function PaymentScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    id: string;
    payable_type?: 'appointment' | 'lab_order' | 'package_purchase';
    payable_id?: string;
  }>();

  const isNew = params.id === 'new';
  const [status, setStatus] = useState<Status>('pending');
  const webViewLoadedRef = useRef(false);

  const initiate = useMutation({
    mutationFn: () =>
      paymentsApi.initiate({
        payable_type: params.payable_type!,
        payable_id: Number(params.payable_id),
      }),
    onError: (e: unknown) => {
      if (e instanceof ApiError) setStatus('failed');
    },
  });

  useEffect(() => {
    if (isNew && params.payable_type && params.payable_id && !initiate.data && !initiate.isPending) {
      initiate.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, params.payable_type, params.payable_id]);

  const showQuery = useQuery({
    queryKey: ['payment', params.id],
    queryFn: () => paymentsApi.show(Number(params.id)),
    enabled: !isNew && params.id !== undefined,
  });

  const paymentData = initiate.data;
  const html = useMemo(() => {
    if (!paymentData) return '';
    return buildAutoSubmitHtml(paymentData.checkout_url, paymentData.params);
  }, [paymentData]);

  const handleNavigation = useCallback(
    (event: WebViewNavigation) => {
      const url = event.url;
      if (url.startsWith('medihub://payment/success')) {
        setStatus('success');
        void queryClient.invalidateQueries({ queryKey: ['passbook'] });
        void queryClient.invalidateQueries({ queryKey: ['appointments'] });
        void queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
        return;
      }
      if (url.startsWith('medihub://payment/cancel')) {
        setStatus('cancelled');
      }
    },
    [queryClient],
  );

  if (isNew && initiate.isPending) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: true, title: t('payment.title') }} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.darkTeal} />
          <Text style={styles.loadingLabel}>{t('payment.openingCheckout')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isNew && initiate.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: true, title: t('payment.title') }} />
        <ErrorState message={t('payment.failed')} onRetry={() => initiate.mutate()} />
      </SafeAreaView>
    );
  }

  if (status === 'success' || status === 'cancelled' || status === 'failed') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: true, title: t('payment.title') }} />
        <View style={{ padding: spacing.screen }}>
          <Card>
            <View style={styles.resultRow}>
              {status === 'success' ? (
                <CheckCircle2 size={64} color={colors.emerald} />
              ) : (
                <XCircle size={64} color={colors.danger} />
              )}
              <Text style={styles.resultTitle}>
                {status === 'success' ? t('payment.success') : status === 'cancelled' ? t('payment.cancelled') : t('payment.failed')}
              </Text>
            </View>
          </Card>
          <View style={{ marginTop: spacing.md, gap: 8 }}>
            <Button label={t('common.done')} onPress={() => router.replace('/(tabs)/home')} />
            {status !== 'success' ? (
              <Button label={t('payment.tryAgain')} variant="secondary" onPress={() => initiate.mutate()} />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!isNew && !showQuery.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Stack.Screen options={{ headerShown: true, title: t('payment.title') }} />
        <ActivityIndicator color={colors.darkTeal} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: t('payment.title') }} />
      {paymentData ? (
        <WebView
          originWhitelist={['https://*', 'http://*', 'medihub://*']}
          source={{ html, baseUrl: 'https://app.medihub.lk' }}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url.startsWith('medihub://payment/')) {
              handleNavigation({ ...req } as WebViewNavigation);
              return false;
            }
            return true;
          }}
          onNavigationStateChange={handleNavigation}
          onMessage={(e: WebViewMessageEvent) => {
            if (e.nativeEvent.data === 'ready') webViewLoadedRef.current = true;
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.darkTeal} />
              <Text style={styles.loadingLabel}>{t('payment.openingCheckout')}</Text>
            </View>
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

function buildAutoSubmitHtml(checkoutUrl: string, params: Record<string, string>): string {
  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(String(v ?? ''))}" />`)
    .join('');

  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;color:#0F172A}</style>
</head>
<body>
  <div>Redirecting to secure payment…</div>
  <form id="f" method="post" action="${escapeHtml(checkoutUrl)}">${inputs}</form>
  <script>
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ready');
    document.getElementById('f').submit();
  </script>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingLabel: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  resultRow: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  resultTitle: { fontFamily: fontFamily.medium, fontSize: 18, color: colors.textPrimary },
});
