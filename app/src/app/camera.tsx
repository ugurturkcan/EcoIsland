import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { api, type Img } from '@/api';
import { Em, ErrorBox, Footer, PrimaryButton, Screen, T, TopBar } from '@/components/ui';
import { useStore } from '@/store';
import { colors, radius, space } from '@/theme';

async function toJpeg(uri: string): Promise<Img> {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: 768, height: null });
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
  if (!out.base64) throw new Error('Fotoğraf işlenemedi.');
  return { data: out.base64, mimeType: 'image/jpeg' };
}

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setFlow = useStore((s) => s.setFlow);

  async function shoot() {
    if (!cam.current || busy) return;
    setBusy(true); setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const pic = await cam.current.takePictureAsync({ quality: 0.8, shutterSound: false });
      const img = await toJpeg(pic.uri);
      const scan = await api.identify(img);
      setFlow({ photo: img, scan, idea: null, preview: null, verify: null });
      router.replace('/item');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir şeyler ters gitti.');
    } finally {
      setBusy(false);
    }
  }

  if (!permission) return <Screen dark><ActivityIndicator style={{ flex: 1 }} color={colors.lime} /></Screen>;
  if (!permission.granted) {
    return (
      <Screen>
        <TopBar close label="Kamera izni" />
        <View style={{ flex: 1, paddingHorizontal: space.gutter, justifyContent: 'center', gap: space.lg }}>
          <T v="h1">Eşyanı görmem için <Em size={34}>kameraya</Em> ihtiyacım var.</T>
          <T v="body" color={colors.muted}>Hile olmasın diye yalnızca canlı kamera kullanılır; galeriden fotoğraf seçilemez.</T>
        </View>
        <Footer><PrimaryButton title="Kameraya izin ver" onPress={requestPermission} /></Footer>
      </Screen>
    );
  }

  return (
    <Screen dark>
      <TopBar dark close label="Yeni eşya" />
      <View style={st.frame}>
        <CameraView ref={cam} style={{ flex: 1 }} facing="back" onCameraReady={() => setReady(true)} />
        <View pointerEvents="none" style={st.corners}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => <View key={c} style={[st.corner, st[c]]} />)}
        </View>
        <View pointerEvents="none" style={st.hint}>
          <T v="label" color={colors.sky}>{busy ? 'Yapay zekâ bakıyor…' : 'Tanıma'}</T>
          <T v="small" color={colors.onInkMuted} style={{ marginTop: 4 }}>Atmak üzere olduğun eşyayı çerçevenin ortasına al.</T>
        </View>
      </View>
      {error && <ErrorBox message={error} />}
      <View style={{ alignItems: 'center', paddingVertical: space.lg }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fotoğraf çek" onPress={shoot} disabled={!ready || busy}
          style={({ pressed }) => [st.shutter, { opacity: ready ? 1 : 0.5, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
          {busy ? <ActivityIndicator color={colors.lime} /> : <View style={st.shutterIn} />}
        </Pressable>
      </View>
    </Screen>
  );
}

const C = 28;
const st = StyleSheet.create({
  frame: { flex: 1, marginHorizontal: space.lg, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#2A332D' },
  corners: { ...StyleSheet.absoluteFill, margin: 48 },
  corner: { position: 'absolute', width: C, height: C, borderColor: colors.lime },
  tl: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 8 },
  tr: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 8 },
  bl: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 8 },
  br: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 8 },
  hint: { position: 'absolute', left: 14, right: 14, bottom: 14, backgroundColor: colors.ink, borderRadius: radius.md, padding: 14 },
  shutter: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: colors.onInk, alignItems: 'center', justifyContent: 'center' },
  shutterIn: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.lime },
});
