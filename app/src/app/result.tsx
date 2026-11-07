import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Island3D } from '@/components/Island3D';
import { Em, Footer, PrimaryButton, Screen, T } from '@/components/ui';
import { levelFor, saplingsFor } from '@/levels';
import { useStore, type Choice } from '@/store';
import { colors, fonts, radius, space } from '@/theme';
import { HOME } from '@/routes';

const TR_POP = 85_000_000;   // TÜİK 2024 ≈ 85,6 milyon
const CAR_KG_PER_KM = 0.17304; // DEFRA 2025, ortalama araba
const EARTH_KM = 40_075;

const fmt = (n: number) => Math.round(n).toLocaleString('tr-TR');

function CompareRow({ label, trash, mine }: { label: string; trash: string; mine: string }) {
  return (
    <View style={st.cmpRow}>
      <T v="caption" color={colors.muted} style={st.cmpLabel}>{label}</T>
      <View style={[st.cmpCell, { backgroundColor: colors.paperRaised }]}><T v="small">{trash}</T></View>
      <View style={[st.cmpCell, { backgroundColor: colors.moss }]}><T v="small" color={colors.onInk}>{mine}</T></View>
    </View>
  );
}

export default function Result() {
  const { choice = 'recycle' } = useLocalSearchParams<{ choice?: Choice }>();
  const s = useStore();
  if (!s.scan) return <Redirect href={HOME} />;

  const accepted = true;
  const lvNow = levelFor(s.avoidedG);
  const leveledUp = lvNow.n > s.levelBefore;
  const newSapling = saplingsFor(s.avoidedG) > s.saplingsBefore;
  const c = s.scan.carbon;
  const isTrash = choice === 'trash';
  // Çöpe atıldıysa karşılaştırma "yeni hayat verseydin" senaryosuyla yapılır.
  const perPersonG = isTrash ? c.avoided.upcycleG : s.lastAwardG;
  const scaleT = (perPersonG * TR_POP) / 1e6;
  const laps = (scaleT * 1000) / CAR_KG_PER_KM / EARTH_KM;
  const wasted = `${fmt(c.productionG)} g CO₂e ve ${c.water.productionL.toLocaleString('tr-TR')} L su boşa gider`;
  const mineCol = isTrash
    ? { head: 'Yeni hayat verseydin', where: 'Evinde yeni bir eşya', end: `−${fmt(c.avoided.upcycleG)} g CO₂e, −${c.water.savedUpcycleL.toLocaleString('tr-TR')} L su` }
    : choice === 'upcycle'
      ? { head: 'Senin seçimin', where: s.idea?.title_tr ?? 'Yeni bir eşya', end: 'Çöpe bir eşya eksik gitti' }
      : { head: 'Senin seçimin', where: `${c.bin} kutusu, yeni ürüne hammadde`, end: 'Malzeme döngüde kaldı' };

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

        <T v="h1">{isTrash ? 'Ya yeni hayat verseydin?' : <>Ya <Em size={34} color={colors.clay}>çöpe</Em> atsaydın?</>}</T>
        <View style={st.cmp}>
          <View style={st.cmpRow}>
            <View style={st.cmpLabel} />
            <View style={[st.cmpHead, { backgroundColor: colors.sand }]}><T v="label" color={colors.clay}>{isTrash ? 'Çöpe gitti' : 'Çöpe atsaydın'}</T></View>
            <View style={[st.cmpHead, { backgroundColor: colors.ink }]}><T v="label" color={colors.lime}>{mineCol.head}</T></View>
          </View>
          <CompareRow label="Doğada" trash={`${c.decompositionLabel} kalır`} mine={choice === 'recycle' ? 'Yeniden üretime girer' : 'Kullanımda'} />
          <CompareRow label="Nereye" trash="Çöp sahası, oradan doğaya" mine={mineCol.where} />
          <CompareRow label="Sonu" trash={wasted} mine={mineCol.end} />
        </View>

        {perPersonG > 0 && (
          <View style={st.scale}>
            <T v="label" color={colors.skyInk}>{isTrash ? 'Herkes yeni hayat verseydi' : 'Herkes bunu yapsaydı'}</T>
            <T v="small">{`85 milyon kişi aynısını yapsa ${fmt(scaleT)} ton CO₂e kaçınılır: arabayla Dünya'yı ${fmt(laps)} kez dolaşmak kadar.`}</T>
          </View>
        )}

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
  cmp: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  cmpRow: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  cmpLabel: { width: 64, padding: 10 },
  cmpHead: { flex: 1, paddingHorizontal: 10, paddingVertical: 8 },
  cmpCell: { flex: 1, padding: 10 },
  scale: { backgroundColor: colors.sky, borderRadius: radius.lg, padding: space.lg, gap: 4 },
  level: { borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.moss },
});
