import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Divider, T } from '@/components/ui';
import { fmtKg, KG_PER_SAPLING, levelFor, LEVELS, saplingsFor } from '@/levels';
import { useStore } from '@/store';
import { colors, fonts, radius, space } from '@/theme';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <T v="h2">{value}</T>
      <T v="caption" color={colors.muted}>{label}</T>
    </View>
  );
}

function Row({ title, detail, onPress, danger }: { title: string; detail?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} disabled={!onPress}
      style={({ pressed }) => [st.row, { opacity: pressed ? 0.6 : 1 }]}>
      <T v="bodyStrong" color={danger ? colors.clay : colors.ink} style={{ flex: 1 }}>{title}</T>
      {detail ? <T v="small" color={colors.muted}>{detail}</T> : null}
      {onPress ? <T v="title" color={colors.muted}>›</T> : null}
    </Pressable>
  );
}

/** Profil: kullanıcı, seviye yolculuğu, fidanlar ve ayarlar (tüm veriler cihazda). */
export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { name, setName, items, avoidedG, waterL, joinedAt, clearAll } = useStore();
  const [draft, setDraft] = useState(name);
  const [now] = useState(() => Date.now());
  const lv = levelFor(avoidedG);
  const saplings = saplingsFor(avoidedG);
  const display = name.trim() || 'Ada sakini';
  const initials = display.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toLocaleUpperCase('tr-TR');
  const days = Math.max(1, Math.ceil((now - joinedAt) / 86400000));

  const reset = () => Alert.alert('Tüm veriler silinsin mi?', 'Adan, eşya geçmişin ve kaçınım toplamların sıfırlanır. Bu işlem geri alınamaz.', [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'Sıfırla', style: 'destructive', onPress: clearAll },
  ]);

  return (
    <ScrollView style={{ backgroundColor: colors.paper }} keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + 120, paddingHorizontal: space.gutter }}>
      <T v="label" color={colors.muted}>Profil</T>

      <View style={st.head}>
        <View style={st.avatar}><T v="h2" color={colors.lime}>{initials}</T></View>
        <View style={{ flex: 1, gap: 4 }}>
          <TextInput value={draft} onChangeText={setDraft} onEndEditing={() => setName(draft)} onSubmitEditing={() => setName(draft)}
            placeholder="Adını yaz" placeholderTextColor={colors.muted} maxLength={32} returnKeyType="done" accessibilityLabel="Adın"
            style={st.name} />
          <T v="small" color={colors.muted}>{`Seviye ${lv.n} · ${lv.name} · ${days} gündür adada`}</T>
        </View>
      </View>

      <View style={st.stats}>
        <Stat value={`${fmtKg(avoidedG)} kg`} label="CO₂e kaçınıldı" />
        <Stat value={`${Math.round(waterL).toLocaleString('tr-TR')} L`} label="su kaçınıldı" />
        <Stat value={String(items.filter((i) => i.choice !== 'trash').length)} label="eşya kurtarıldı" />
      </View>

      <T v="label" color={colors.muted} style={{ marginTop: space.xxl }}>Seviye yolculuğu</T>
      <View style={{ marginTop: space.md, gap: 8 }}>
        {LEVELS.map((l) => {
          const done = l.n < lv.n, current = l.n === lv.n;
          return (
            <View key={l.n} style={[st.level, current && { backgroundColor: colors.ink }]}>
              <View style={[st.levelNum, { backgroundColor: done ? colors.moss : current ? colors.lime : colors.sand }]}>
                <T v="title" color={done ? colors.onInk : colors.ink}>{done ? '✓' : String(l.n)}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T v="title" color={current ? colors.onInk : l.n > lv.n ? colors.muted : colors.ink}>{l.name}</T>
                <T v="caption" color={current ? colors.onInkMuted : colors.muted}>{l.minKg ? `${l.minKg} kg CO₂e` : 'Başlangıç'}</T>
              </View>
              {current && <T v="caption" color={colors.lime} style={{ fontFamily: fonts.semibold }}>Şu an</T>}
            </View>
          );
        })}
      </View>

      <T v="label" color={colors.muted} style={{ marginTop: space.xxl }}>Gerçek fidanların</T>
      <View style={st.card}>
        <T v="h3">{saplings ? `${saplings} fidan dikildi` : 'Henüz fidan yok'}</T>
        <T v="small" color={colors.muted} style={{ marginTop: 4 }}>{`Her ${KG_PER_SAPLING} kg CO₂e kaçınımda sponsor fonuyla adına bir fidan bağışlanır. Hedef ortak: TEMA Vakfı · şu an demo modunda.`}</T>
      </View>

      <T v="label" color={colors.muted} style={{ marginTop: space.xxl }}>Ayarlar</T>
      <View style={{ marginTop: space.sm }}>
        <Row title="Verilerin" detail="Sadece bu cihazda" />
        <Divider />
        <Row title="Hesap yöntemi" detail="DEFRA 2025 · IPCC AR5" />
        <Divider />
        <Row title="Tüm verileri sıfırla" danger onPress={reset} />
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginTop: space.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.6, color: colors.ink, padding: 0, minHeight: 32 },
  stats: { flexDirection: 'row', gap: space.md, marginTop: space.xl, padding: space.lg, backgroundColor: colors.sand, borderRadius: radius.lg },
  level: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: colors.paperRaised },
  levelNum: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  card: { marginTop: space.md, padding: space.lg, backgroundColor: colors.paperRaised, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 52 },
});
