import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';

import { islandHtml } from '@/island/islandHtml';
import { colors } from '@/theme';

// react-native-webview 14 tipleri RN 0.88 ile çakışıyor (props: never); çalışma zamanı API'si aynı.
const WebView = RNWebView as unknown as ComponentType<Record<string, unknown> & { ref?: unknown }>;
interface WebViewHandle { injectJavaScript: (js: string) => void }


interface Props { level: number; zoom?: number; cy?: number; style?: ViewStyle }

export function Island3D({ level, zoom, cy, style }: Props) {
  const ref = useRef<WebViewHandle>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  // HTML yalnızca ilk açılışta üretilir; seviye ve zoom sonradan JS ile değiştirilir (sahne yeniden yüklenmez).
  const html = useMemo(() => islandHtml({ level, zoom, cy }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { ref.current?.injectJavaScript(`window.adacik && window.adacik.setLevel(${level}); true;`); }, [level]);
  useEffect(() => { if (zoom != null) ref.current?.injectJavaScript(`window.adacik && window.adacik.setZoom(${zoom}); true;`); }, [zoom]);

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled
        onMessage={(e: { nativeEvent: { data: string } }) => setStatus(e.nativeEvent.data === 'ready' ? 'ready' : 'failed')}
        accessibilityLabel={`Döndürülebilir 3D ada, seviye ${level}`}
      />
      {status !== 'ready' && (
        <View style={styles.overlay} pointerEvents="none">
          {status === 'loading' ? <ActivityIndicator color={colors.moss} /> : <Text style={styles.msg}>3D ada yüklenemedi. İnternet bağlantını kontrol et.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#8FD0EC' },
  web: { flex: 1, backgroundColor: '#8FD0EC' },
  overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 24 },
  msg: { color: colors.ink, textAlign: 'center', fontSize: 14 },
});
