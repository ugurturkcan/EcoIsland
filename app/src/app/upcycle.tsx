import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { api, type Idea } from '@/api';
import { ErrorBox, Footer, PrimaryButton, Screen, T, TopBar } from '@/components/ui';
import { useStore } from '@/store';
import { colors, fonts, radius, space } from '@/theme';
import { HOME } from '@/routes';

export default function Upcycle() {
  const scan = useStore((s) => s.scan);
  const photo = useStore((s) => s.photo);
  const preview = useStore((s) => s.preview);
  const setFlow = useStore((s) => s.setFlow);
  const complete = useStore((s) => s.complete);
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [sel, setSel] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [vizErr, setVizErr] = useState<string | null>(null);
  const [vizBusy, setVizBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const runVisualize = useCallback((target: Idea) => {
    if (!photo) return;
    setVizBusy(true); setVizErr(null); setFlow({ idea: target, preview: null });
    api.visualize(photo, target.visual_prompt_en)
      .then((r) => setFlow({ preview: r.image }))
      .catch((e: Error) => setVizErr(/kota|quota/i.test(e.message) ? 'Görsel önizleme şu an kapalı (görsel üretim kotası yok). Fikir ve adımlar aşağıda.' : e.message))
      .finally(() => setVizBusy(false));
  }, [photo, setFlow]);

  useEffect(() => {
    if (!scan) return;
    let alive = true;
    api.ideas(scan.item.name, scan.item.material, scan.item.condition)
      .then((r) => { if (!alive) return; setIdeas(r.ideas); setSel(0); runVisualize(r.ideas[0]); })
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [scan, reloadKey, runVisualize]);

  const load = () => { setErr(null); setIdeas(null); setReloadKey((k) => k + 1); };
  const pick = (i: number) => { if (!ideas || i === sel) return; Haptics.selectionAsync().catch(() => {}); setSel(i); runVisualize(ideas[i]); };
  const idea = ideas?.[sel];

  if (!scan) return <Redirect href={HOME} />;

  return (
    <Screen>
      <TopBar label="Yeni hayat ver" />
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        {err && <ErrorBox message={err} onRetry={load} />}
        {!ideas && !err && (
          <View style={{ paddingVertical: 64, alignItems: 'center', gap: space.md }}>
            <ActivityIndicator color={colors.moss} />
            <T v="small" color={colors.muted}>{`${scan.item.name} için fikirler düşünülüyor…`}</T>
          </View>
        )}
        {ideas && idea && (
          <>
            <T v="label" color={colors.skyInk} style={{ paddingHorizontal: space.gutter }}>Yapay zekâ 3 fikir üretti</T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: space.gutter, paddingTop: space.md }}>
              {ideas.map((it, i) => (
                <Pressable key={it.title_tr} accessibilityRole="tab" accessibilityState={{ selected: i === sel }} onPress={() => pick(i)}
                  style={[st.chip, i === sel ? { backgroundColor: colors.ink, borderColor: colors.ink } : { borderColor: colors.lineStrong }]}>
                  <T v="small" color={i === sel ? colors.onInk : colors.ink} style={{ fontFamily: fonts.semibold }}>{it.title_tr}</T>
                </Pressable>
              ))}
            </ScrollView>

            <View style={st.preview}>
              {preview ? (
                <Image source={{ uri: `data:${preview.mimeType};base64,${preview.data}` }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={`Senin eşyan: ${idea.title_tr}`} transition={250} />
              ) : (
                <>
                  {photo && <Image source={{ uri: `data:${photo.mimeType};base64,${photo.data}` }} style={[StyleSheet.absoluteFill, { opacity: vizBusy ? 0.55 : 0.35 }]} contentFit="cover" />}
                  <View style={st.previewMsg}>
                    {vizBusy ? <ActivityIndicator color={colors.skyInk} /> : null}
                    <T v="small" color={colors.ink} style={{ textAlign: 'center' }}>{vizBusy ? 'Senin eşyan dönüştürülüyor…' : vizErr ?? 'Önizleme hazır değil.'}</T>
                    {vizErr && !/kota/.test(vizErr) && (
                      <Pressable accessibilityRole="button" onPress={() => runVisualize(idea)} style={{ minHeight: 44, justifyContent: 'center' }}><T v="title">Tekrar dene</T></Pressable>
                    )}
                  </View>
                </>
              )}
              <View style={st.previewTag} pointerEvents="none"><T v="label" color={colors.skyInk}>AI önizleme · senin eşyan</T></View>
            </View>

            <View style={{ paddingHorizontal: space.gutter, marginTop: space.xl }}>
              <T v="h2">{idea.title_tr}</T>
              <T v="body" color={colors.muted} style={{ marginTop: 6 }}>{idea.pitch_tr}</T>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: space.md }}>
                <View style={st.meta}><T v="caption" style={{ fontFamily: fonts.medium }}>{idea.difficulty}</T></View>
                <View style={st.meta}><T v="caption" style={{ fontFamily: fonts.medium }}>{`${idea.minutes} dk`}</T></View>
              </View>
              <T v="label" color={colors.muted} style={{ marginTop: space.xl }}>Malzemeler</T>
              <T v="body" color={colors.inkSoft} style={{ marginTop: 4 }}>{idea.materials_tr.join(' · ')}</T>
              <T v="label" color={colors.muted} style={{ marginTop: space.xl }}>Adımlar</T>
              {idea.steps_tr.map((step, i) => (
                <View key={i} style={st.step}>
                  <T v="h3" color={colors.moss} style={{ fontFamily: fonts.serif, width: 20 }}>{String(i + 1)}</T>
                  <T v="body" color={colors.inkSoft} style={{ flex: 1 }}>{step}</T>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <Footer><PrimaryButton title="Yaptım, adama ekle" icon="✓" disabled={!idea} onPress={() => { complete('upcycle'); router.replace({ pathname: '/result', params: { choice: 'upcycle' } }); }} /></Footer>
    </Screen>
  );
}

const st = StyleSheet.create({
  chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1 },
  preview: { marginHorizontal: space.gutter, marginTop: space.lg, height: 280, borderRadius: radius.xl, backgroundColor: colors.sky, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  previewMsg: { alignItems: 'center', gap: 10, paddingHorizontal: 28 },
  previewTag: { position: 'absolute', top: 14, left: 14, backgroundColor: colors.paperRaised, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  meta: { backgroundColor: colors.sand, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  step: { flexDirection: 'row', gap: 14, paddingVertical: 12, borderTopWidth: 1, borderColor: colors.line, alignItems: 'baseline' },
});
