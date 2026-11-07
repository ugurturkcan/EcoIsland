import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Island3D } from '@/components/Island3D';
import { Em, Footer, PrimaryButton, Screen, T } from '@/components/ui';
import { levelFor, saplingsFor } from '@/levels';
import { useStore, type Choice } from '@/store';
import { colors, fonts, radius, space } from '@/theme';
import { HOME } from '@/routes';

const YEARS = [0, 10, 50, 200, 450];

function trashStage(y: number, label: string) {
  if (y === 0) return 'Eşya çöp kutusunda. Yolculuk başlıyor.';
  if (y <= 10) return 'Rüzgârla denize ulaştı, güneşte kırılganlaşıyor.';
  if (y <= 50) return 'Parçalanıyor; balıklar mikroplastik yutuyor.';
  if (y <= 200) return 'Hâlâ denizde: binlerce mikroplastik parça.';
  return `${label} sonra bile tamamen yok olmadı.`;
}

export default function Result() {
  const { choice = 'recycle' } = useLocalSearchParams<{ choice?: Choice }>();
  const s = useStore();
  const [yi, setYi] = useState(0);
  if (!s.scan) return <Redirect href={HOME} />;

  const accepted = true;
  const lvNow = levelFor(s.avoidedG);
  const leveledUp = lvNow.n > s.levelBefore;
  const newSapling = saplingsFor(s.avoidedG) > s.saplingsBefore;
  const y = YEARS[yi];
  const mine = choice === 'upcycle' ? `${s.idea?.title_tr ?? 'Yeni ürünün'} hâlâ kullanımda. Çöpe bir eşya eksik gitti.`
    : choice === 'recycle' ? 'Eşya yeni bir ürünün hammaddesi oldu.' : 'Bu sefer çöpe gitti. Bir sonraki eşyada adan seni bekliyor.';

  const goHome = () => { s.resetFlow(); router.dismissTo(HOME); };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.gutter, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
        {choice !== 'trash' && (
          <View style={[st.badge, { backgroundColor: colors.lime }]}>
            <T v="small" style={{ fontFamily: fonts.semibold }}>{choice === 'upcycle' ? 'Yeni hayat verildi' : 'Geri dönüşüme gitti'}</T>
          </View>
        )}

        {accepted && s.lastAwardG > 0 && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={[st.award, { backgroundColor: colors.ink }]}>
              <T v="h1" color={colors.onInk}>{`−${s.lastAwardG}`}<T v="title" color={colors.onInk} style={{ fontFamily: fonts.serif }}> g CO₂e</T></T>
              <T v="caption" color={colors.onInkMuted}>kaçınılan karbon</T>
            </View>
            <View style={[st.award, { backgroundColor: colors.sky }]}>
              <T v="h1">{`−${s.lastAwardL.toLocaleString('tr-TR')}`}<T v="title" style={{ fontFamily: fonts.serif }}> L su</T></T>
              <T v="caption" color={colors.skyInk}>{s.scan.carbon.water.estimated ? 'kaçınılan su · tahmini' : 'kaçınılan su'}</T>
            </View>
          </View>
        )}

        <T v="h1">Ya <Em size={34} color={colors.clay}>çöpe</Em> atsaydın?</T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[st.sim, { backgroundColor: colors.sand }]}>
            <T v="label" color={colors.clay}>Çöpe atsaydın</T>
            <T v="small" color={colors.inkSoft}>{trashStage(y, s.scan.carbon.decompositionLabel)}</T>
          </View>
          <View style={[st.sim, { backgroundColor: colors.ink }]}>
            <T v="label" color={colors.lime}>Senin seçimin</T>
            <T v="small" color={colors.onInkMuted}>{mine}</T>
          </View>
        </View>
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T v="small" color={colors.muted}>Zamanı ilerlet</T>
            <T v="label">{y === 0 ? 'Bugün' : `${y} yıl sonra`}</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="tablist">
            {YEARS.map((yr, i) => (
              <Pressable key={yr} accessibilityRole="tab" accessibilityState={{ selected: i === yi }} onPress={() => setYi(i)}
                style={[st.year, i <= yi ? { backgroundColor: colors.moss, borderColor: colors.moss } : { borderColor: colors.lineStrong }]}>
                <T v="caption" color={i <= yi ? colors.onInk : colors.ink} style={{ fontFamily: fonts.semibold }}>{yr === 0 ? 'Bugün' : String(yr)}</T>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={st.level}>
          <Island3D level={lvNow.n} zoom={15} cy={0.5} style={{ height: 210 }} />
          <View style={{ padding: space.lg, gap: 6 }}>
            {leveledUp && <T v="label" color={colors.lime}>Seviye atladın</T>}
            <T v="h3" color={colors.onInk}>{`Seviye ${lvNow.n} · `}<Em color={colors.onInk}>{lvNow.name}</Em></T>
            <T v="small" color="#D5DCCF">{choice === 'trash' ? 'Puan yok; adanın sahiline küçük bir çöp geldi.' : `Adana ${choice === 'upcycle' ? 'bir çiçek' : 'bir fidan'} geldi.`}</T>
            {newSapling && <T v="small" color={colors.lime}>5 kg eşiği aşıldı: sponsor fonuyla adına gerçek bir fidan bağışlandı. Hedef ortak: TEMA Vakfı · demo modu</T>}
          </View>
        </View>
      </ScrollView>
      <Footer><PrimaryButton title="Adana dön" onPress={goHome} /></Footer>
    </Screen>
  );
}

const st = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  award: { flex: 1, borderRadius: radius.lg, padding: space.lg, gap: 4 },
  sim: { flex: 1, borderRadius: radius.lg, padding: 14, gap: space.sm, minHeight: 150 },
  year: { flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  level: { borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.moss },
});
