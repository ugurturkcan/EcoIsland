import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Em, Footer, PrimaryButton, Screen, T, TopBar } from '@/components/ui';
import { useStore } from '@/store';
import { colors, fonts, radius, space } from '@/theme';
import { HOME } from '@/routes';

const BIN_COLORS: Record<string, string> = { sarı: '#F3D96B', yeşil: '#6DBE4B', gri: '#A9A39A', mavi: '#5A9BD8', tekstil: '#C9B8E8', evsel: '#9C978E' };

const PREP: Record<string, string[]> = {
  PET: ['Kapağını ayır; kapak da sarı kutuya gider.', 'İçini boşalt, hafifçe durula.', 'Ezerek hacmini küçült.'],
  HDPE: ['İçini boşalt ve durula.', 'Kapağını ayır.'],
  PP: ['Yemek artığını temizle.', 'Kapağı ayrı at.'],
  mixed_plastic: ['Temizle ve kurula.', 'Farklı plastikleri ayır.'],
  glass: ['Metal kapağı ayır (gri kutuya).', 'Durula; kırık camı ayrıca sar.'],
  aluminium: ['İçini boşalt.', 'Ezerek küçült.'],
  steel: ['Yemek artığını temizle.', 'Keskin kapağı içine bastır.'],
  paper: ['Kuru ve temiz olsun.', 'Yağlı kâğıtları ayır.'],
  cardboard: ['Bantları sök.', 'Katlayıp düzleştir.'],
  cotton: ['Temiz ve kuru olarak tekstil kumbarasına bırak.'],
  polyester: ['Temiz ve kuru olarak tekstil kumbarasına bırak.'],
};

export default function Recycle() {
  const scan = useStore((s) => s.scan);
  const complete = useStore((s) => s.complete);
  if (!scan) return <Redirect href={HOME} />;
  const { bin, avoided, water } = scan.carbon;
  const key = Object.keys(BIN_COLORS).find((k) => bin.startsWith(k));
  const steps = PREP[scan.item.material] ?? ['Temiz ve kuru olduğundan emin ol.'];

  return (
    <Screen>
      <TopBar label="Geri dönüştür" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.gutter, paddingBottom: space.xxl }}>
        <T v="h1">Doğru kutu: <Em size={34}>{bin}</Em></T>
        <View style={[st.bin, { backgroundColor: key ? BIN_COLORS[key] : colors.sand }]}>
          <View style={st.binBody}><View style={st.binLid} /><T v="h1" color="rgba(24,32,27,0.45)" style={{ marginTop: 14, fontFamily: fonts.regular }}>♻</T></View>
        </View>
        <T v="label" color={colors.muted} style={{ marginTop: space.xl }}>Hazırlık</T>
        {steps.map((step, i) => (
          <View key={i} style={st.step}>
            <T v="h3" style={{ fontFamily: fonts.serif, width: 20 }} color={colors.moss}>{String(i + 1)}</T>
            <T v="body" color={colors.inkSoft} style={{ flex: 1 }}>{step}</T>
          </View>
        ))}
        <View style={st.gain}>
          <T v="small" color={colors.inkSoft}>{`Kutuya attığında ${avoided.recycleG} g CO₂e ve ${water.savedRecycleL.toLocaleString('tr-TR')} L su kaçınımı hesabına eklenir; adana bir fidan gelir.`}</T>
        </View>
      </ScrollView>
      <Footer><PrimaryButton title="Kutuya attım" icon="✓" onPress={() => { complete('recycle'); router.replace({ pathname: '/result', params: { choice: 'recycle' } }); }} /></Footer>
    </Screen>
  );
}

const st = StyleSheet.create({
  bin: { height: 170, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginTop: space.xl },
  binBody: { width: 92, height: 112, borderRadius: 14, backgroundColor: 'rgba(24,32,27,0.12)', alignItems: 'center', paddingTop: 10 },
  binLid: { width: 72, height: 10, borderRadius: 5, backgroundColor: 'rgba(24,32,27,0.25)' },
  step: { flexDirection: 'row', gap: 14, paddingVertical: 12, borderTopWidth: 1, borderColor: colors.line, alignItems: 'baseline' },
  gain: { marginTop: space.xl, padding: space.lg, borderRadius: radius.md, backgroundColor: colors.sky },
});
