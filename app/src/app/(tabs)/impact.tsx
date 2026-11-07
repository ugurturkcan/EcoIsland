import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Divider, Em, Progress, T } from '@/components/ui';
import { fmtKg, KG_PER_SAPLING, saplingsFor } from '@/levels';
import { useStore, type Choice, type SavedItem } from '@/store';
import { colors, fonts, radius, space } from '@/theme';

const CAR_G_PER_KM = 173; // DEFRA 2025 "Average car"

const CHOICE: Record<Choice, { label: string; color: string }> = {
  upcycle: { label: 'Yeni hayat', color: colors.moss },
  recycle: { label: 'Geri dönüşüm', color: colors.water },
  trash: { label: 'Çöp', color: colors.clay },
};

function fmtL(l: number) {
  return l.toLocaleString('tr-TR', { maximumFractionDigits: l < 10 ? 1 : 0 });
}
function fmtDate(t: number) {
  return new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function Row({ item }: { item: SavedItem }) {
  const c = CHOICE[item.choice];
  return (
    <View style={st.row}>
      <View style={[st.dot, { backgroundColor: c.color }]} />
      <View style={{ flex: 1, gap: 2 }}>
        <T v="title" numberOfLines={1}>{item.ideaTitle ? `${item.name} → ${item.ideaTitle}` : item.name}</T>
        <T v="caption" color={colors.muted}>{`${c.label} · ${item.materialLabel} · ${fmtDate(item.at)}`}</T>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <T v="title" color={item.avoidedG ? colors.moss : colors.muted}>{item.avoidedG ? `−${item.avoidedG} g` : '0 g'}</T>
        <T v="caption" color={colors.water}>{item.waterL ? `−${fmtL(item.waterL)} L` : ''}</T>
      </View>
    </View>
  );
}

/** Etki: kaçınılan karbon ve su, karşılıklar, dağılım ve geçmiş. */
export default function ImpactTab() {
  const insets = useSafeAreaInsets();
  const { items, avoidedG, waterL } = useStore();
  const saplings = saplingsFor(avoidedG);
  const toNextSapling = KG_PER_SAPLING * 1000 - (avoidedG % (KG_PER_SAPLING * 1000));
  const byChoice = (['upcycle', 'recycle', 'trash'] as Choice[]).map((k) => ({ k, n: items.filter((i) => i.choice === k).length, g: items.filter((i) => i.choice === k).reduce((a, i) => a + i.avoidedG, 0) }));
  const total = Math.max(1, items.length);

  return (
    <ScrollView style={{ backgroundColor: colors.paper }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + 120, paddingHorizontal: space.gutter }}>
      <T v="label" color={colors.muted}>Etkin</T>
      <T v="h1" style={{ marginTop: 6 }}>Bugüne kadar <Em size={34}>kurtardıkların.</Em></T>

      <View style={st.hero}>
        <T v="label" color={colors.lime}>Kaçınılan karbon</T>
        <T v="display" color={colors.onInk} style={{ marginTop: 8 }}>
          {fmtKg(avoidedG)}<T v="h2" color={colors.onInk} style={{ fontFamily: fonts.serif }}> kg CO₂e</T>
        </T>
        <T v="small" color={colors.onInkMuted} style={{ marginTop: 6 }}>
          {avoidedG ? `Bir arabayla ${Math.round(avoidedG / CAR_G_PER_KM).toLocaleString('tr-TR')} km yol gitmemek kadar.` : 'İlk eşyanı kurtardığında burada görünecek.'}
        </T>
        <Divider style={{ backgroundColor: '#3A4540', marginVertical: space.lg }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ gap: 2 }}>
            <T v="h3" color={colors.onInk}>{`${saplings} gerçek fidan`}</T>
            <T v="caption" color={colors.onInkMuted}>{`Sonrakine ${fmtKg(toNextSapling)} kg · demo modu`}</T>
          </View>
          <T v="caption" color={colors.lime}>Hedef ortak: TEMA</T>
        </View>
        <View style={{ marginTop: space.md }}><Progress value={1 - toNextSapling / (KG_PER_SAPLING * 1000)} color={colors.lime} track="#3A4540" /></View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <View style={[st.tile, { backgroundColor: colors.sky }]}>
          <T v="label" color={colors.skyInk}>Kaçınılan su</T>
          <T v="h1" color={colors.ink} style={{ marginTop: 6 }}>{fmtL(waterL)}<T v="h3" style={{ fontFamily: fonts.serif }}> L</T></T>
          <T v="caption" color={colors.skyInk}>{`≈ ${Math.round(waterL / 0.5).toLocaleString('tr-TR')} pet şişe su`}</T>
        </View>
        <View style={[st.tile, { backgroundColor: colors.sand }]}>
          <T v="label" color={colors.muted}>Kurtarılan eşya</T>
          <T v="h1" style={{ marginTop: 6 }}>{String(items.filter((i) => i.choice !== 'trash').length)}</T>
          <T v="caption" color={colors.muted}>{`${items.length} eşya tarandı`}</T>
        </View>
      </View>

      <View style={{ marginTop: space.xxl }}>
        <T v="label" color={colors.muted}>Seçimlerin</T>
        <View style={st.stack} accessibilityLabel="Seçim dağılımı">
          {byChoice.map((b) => b.n > 0 && <View key={b.k} style={{ flex: b.n / total, backgroundColor: CHOICE[b.k].color }} />)}
          {!items.length && <View style={{ flex: 1, backgroundColor: colors.line }} />}
        </View>
        {byChoice.map((b) => (
          <View key={b.k} style={st.legend}>
            <View style={[st.dot, { backgroundColor: CHOICE[b.k].color }]} />
            <T v="body" style={{ flex: 1 }}>{CHOICE[b.k].label}</T>
            <T v="bodyStrong">{`${b.n} eşya`}</T>
            <T v="body" color={colors.muted} style={{ width: 76, textAlign: 'right' }}>{`${fmtKg(b.g)} kg`}</T>
          </View>
        ))}
      </View>

      <View style={{ marginTop: space.xxl }}>
        <T v="label" color={colors.muted}>Geçmiş</T>
        {items.length ? items.slice(0, 30).map((i) => <Row key={i.id} item={i} />) : (
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/camera', params: { mode: 'identify' } })} style={st.empty}>
            <T v="title">Henüz eşya yok</T>
            <T v="small" color={colors.muted} style={{ marginTop: 4 }}>Ortadaki kamera butonuyla atmak üzere olduğun ilk eşyayı tara.</T>
          </Pressable>
        )}
      </View>

      <View style={st.sources}>
        <T v="label" color={colors.muted}>Hesap nasıl yapılıyor?</T>
        <T v="small" color={colors.inkSoft} style={{ marginTop: 6 }}>
          Yapay zekâ yalnızca eşyayı, malzemeyi ve ağırlığı tahmin eder. Karbon: UK DESNZ/DEFRA 2025 dönüşüm faktörleri (malzeme kullanımı ve atık bertarafı), IPCC AR5 GWP100. Kaçınım = seçtiğin yol ile çöpe gitme senaryosu arasındaki fark. Su: Water Footprint Network ve EPA değerleri; kaynağı olmayan malzemelerde tahmini değer kullanılır ve kartta belirtilir.
        </T>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  hero: { marginTop: space.xl, backgroundColor: colors.ink, borderRadius: radius.lg, padding: space.xl },
  tile: { flex: 1, borderRadius: radius.lg, padding: space.lg, gap: 2 },
  stack: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: space.md, marginBottom: space.sm, gap: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.line },
  dot: { width: 10, height: 10, borderRadius: 5 },
  empty: { marginTop: space.md, padding: space.xl, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.lineStrong },
  sources: { marginTop: space.xxl, padding: space.lg, backgroundColor: colors.paperRaised, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
});
