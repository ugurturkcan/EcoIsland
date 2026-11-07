import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Island3D } from '@/components/Island3D';
import { Progress, T } from '@/components/ui';
import { fmtKg, LEVELS, levelFor, saplingsFor } from '@/levels';
import { useStore } from '@/store';
import { colors, fonts, radius, space } from '@/theme';

/** Ada: kullanıcının 3D dünyası. Tam ekran; alt kartta seviye ve ilerleme. */
export default function AdaTab() {
  const insets = useSafeAreaInsets();
  const avoidedG = useStore((s) => s.avoidedG);
  const items = useStore((s) => s.items);
  const lv = levelFor(avoidedG);
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? lv.n;
  const L = LEVELS[shown - 1];
  const saved = items.filter((i) => i.choice !== 'trash').length;
  const saplings = saplingsFor(avoidedG);
  const locked = shown > lv.n;

  return (
    <View style={{ flex: 1, backgroundColor: '#8FD0EC' }}>
      <Island3D level={shown} cy={0.36} style={StyleSheet.absoluteFill} />

      <View pointerEvents="box-none" style={[st.top, { paddingTop: insets.top + space.sm }]}>
        <View style={st.brand}>
          <View style={st.logo}><View style={st.logoIsland} /></View>
          <T v="h3" style={{ fontFamily: fonts.bold, letterSpacing: -0.8 }}>adacık</T>
        </View>
        <View style={st.chip}><T v="label">3D dünya</T></View>
      </View>

      <View style={[st.card, { bottom: insets.bottom + 92 }]}>
        <T v="label" color={colors.muted}>{`Seviye ${shown} / 5${locked ? ' · kilitli önizleme' : preview && preview < lv.n ? ' · geçmiş' : ' · şu an'}`}</T>
        <T v="h2" style={{ marginTop: 4 }}>{L.name}</T>

        {locked ? (
          <T v="small" color={colors.muted} style={{ marginTop: 6 }}>{`${L.minKg} kg CO₂e kaçınınca açılır. Şu an ${fmtKg(avoidedG)} kg.`}</T>
        ) : (
          <>
            <T v="small" color={colors.muted} style={{ marginTop: 6 }}>{`${fmtKg(avoidedG)} kg CO₂e · ${saved} eşya · ${saplings} gerçek fidan`}</T>
            {lv.next && (
              <View style={{ marginTop: space.md, gap: 6 }}>
                <Progress value={lv.progress} />
                <T v="caption" color={colors.muted}>{`Sonraki: ${lv.next.name} · ${fmtKg(lv.next.minKg * 1000 - avoidedG)} kg kaldı`}</T>
              </View>
            )}
          </>
        )}

        <View style={st.levels} accessibilityRole="tablist">
          {LEVELS.map((l) => {
            const active = l.n === shown;
            const isLocked = l.n > lv.n;
            return (
              <Pressable key={l.n} accessibilityRole="tab" accessibilityLabel={`Seviye ${l.n}: ${l.name}${isLocked ? ', kilitli' : ''}`} accessibilityState={{ selected: active }}
                onPress={() => setPreview(l.n === lv.n ? null : l.n)}
                style={[st.lvl, active ? { backgroundColor: colors.ink, borderColor: colors.ink } : { borderColor: colors.lineStrong }]}>
                <T v="title" color={active ? colors.onInk : isLocked ? colors.muted : colors.ink}>{String(l.n)}</T>
              </Pressable>
            );
          })}
        </View>
        <T v="label" color={colors.skyInk} style={{ marginTop: space.md }}>Sürükle: etrafında dön · iki parmak: yakınlaş</T>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.gutter },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.paper, borderRadius: radius.pill, paddingLeft: 6, paddingRight: 14, height: 44 },
  logo: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  logoIsland: { width: 18, height: 8, borderRadius: 8, backgroundColor: colors.lime },
  chip: { backgroundColor: colors.paper, borderRadius: radius.pill, paddingHorizontal: 12, height: 32, justifyContent: 'center' },
  card: { position: 'absolute', left: 12, right: 12, backgroundColor: colors.paper, borderRadius: radius.xl, padding: space.xl },
  levels: { flexDirection: 'row', gap: 6, marginTop: space.lg },
  lvl: { flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
