import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Divider, Em, Footer, Pill, PrimaryButton, Screen, T, TopBar } from '@/components/ui';
import { useStore } from '@/store';
import { colors, fonts, radius, space } from '@/theme';
import { HOME } from '@/routes';

export default function Item() {
  const scan = useStore((s) => s.scan);
  const photo = useStore((s) => s.photo);
  if (!scan) return <Redirect href={HOME} />;
  const { item, carbon, flags } = scan;
  const w = carbon.water;

  return (
    <Screen>
      <TopBar label="Nesne kartı" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.gutter, paddingBottom: space.xxl }}>
        <View style={{ flexDirection: 'row', gap: space.lg, alignItems: 'center', marginTop: space.sm }}>
          {photo && <Image source={{ uri: `data:${photo.mimeType};base64,${photo.data}` }} style={st.photo} contentFit="cover" accessibilityLabel={item.name} />}
          <View style={{ flex: 1, gap: space.sm }}>
            <T v="label" color={colors.skyInk}>{`AI tanıdı · ${Math.round(item.confidence * 100)}%`}</T>
            <T v="h2">{item.name}{item.size ? <Em size={26} color={colors.ink}>{` ${item.size}`}</Em> : null}</T>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Pill border={colors.line}>{carbon.materialLabel}</Pill>
              <Pill border={colors.line}>{`~${item.weightG} g`}</Pill>
              <Pill bg={colors.yellow}>{carbon.bin}</Pill>
            </View>
          </View>
        </View>

        {flags.suspicious && (
          <View style={st.warn}>
            <T v="small" color={colors.clay}>{flags.reason || 'Bu fotoğraf ekran ya da baskı görüntüsü gibi duruyor. Puan için gerçek eşyayı çek.'}</T>
          </View>
        )}

        <Divider style={{ marginTop: space.xxl }} />
        <T v="label" color={colors.muted} style={{ marginTop: space.xl }}>Üretim bedeli</T>
        <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.sm }}>
          <View style={{ flex: 1 }}>
            <T v="display">{String(carbon.productionG)}<T v="h3" style={{ fontFamily: fonts.serif }}> g CO₂e</T></T>
            <T v="small" color={colors.inkSoft}>{`≈ arabayla ${carbon.carMeters} m`}</T>
          </View>
          <View style={{ flex: 1 }}>
            <T v="display" color={colors.water}>{w.productionL.toLocaleString('tr-TR')}<T v="h3" color={colors.water} style={{ fontFamily: fonts.serif }}> L su</T></T>
            <T v="small" color={colors.inkSoft}>{w.estimated ? 'tahmini değer' : 'üretimde kullanılan'}</T>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: space.xl }}>
          <View style={[st.tile, { backgroundColor: colors.ink }]}>
            <T v="h2" color={colors.onInk}>{carbon.decompositionLabel}</T>
            <T v="caption" color={colors.onInkMuted}>çöpe giderse doğada kalma süresi</T>
          </View>
          <View style={[st.tile, { backgroundColor: colors.sand }]}>
            <T v="h2">{`${carbon.avoided.upcycleG} g`}</T>
            <T v="caption" color={colors.muted}>{`yeni hayat verirsen kaçınılır · ${w.savedUpcycleL.toLocaleString('tr-TR')} L su`}</T>
          </View>
        </View>

        <View style={st.source}>
          <T v="label" color={colors.muted}>Kaynak</T>
          <T v="caption" color={colors.inkSoft} style={{ marginTop: 4 }}>{`Karbon: ${carbon.source.carbon}`}</T>
          <T v="caption" color={colors.inkSoft}>{`Su: ${carbon.source.water}`}</T>
        </View>
      </ScrollView>
      <Footer><PrimaryButton title="Kaderini sen seç" onPress={() => router.push('/fate')} /></Footer>
    </Screen>
  );
}

const st = StyleSheet.create({
  photo: { width: 96, height: 120, borderRadius: radius.md, backgroundColor: colors.sand },
  warn: { marginTop: space.lg, backgroundColor: colors.claySoft, borderRadius: radius.md, padding: 12 },
  tile: { flex: 1, borderRadius: radius.lg, padding: space.lg, gap: 6 },
  source: { marginTop: space.xl, padding: space.md, borderRadius: radius.sm, backgroundColor: colors.paperRaised, borderWidth: 1, borderColor: colors.line },
});
