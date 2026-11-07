import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Em, Screen, T, TopBar } from '@/components/ui';
import { useStore } from '@/store';
import { colors, radius, space } from '@/theme';
import { HOME } from '@/routes';

function Option({ n, title, body, gain, onPress, tone }: { n: string; title: string; body: string; gain: string; onPress: () => void; tone: 'featured' | 'soft' | 'outline' }) {
  const featured = tone === 'featured';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${body}. ${gain}`} onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress(); }}
      style={({ pressed }) => [{ borderRadius: radius.xl, padding: space.xl, gap: space.sm, transform: [{ scale: pressed ? 0.985 : 1 }] },
        featured ? { backgroundColor: colors.moss } : tone === 'soft' ? { backgroundColor: colors.sand } : { borderWidth: 1, borderColor: colors.line }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T v="label" color={featured ? colors.lime : colors.muted}>{featured ? `${n} · en çok ödül` : n}</T>
        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: featured ? colors.lime : 'transparent', borderWidth: featured ? 0 : 1, borderColor: colors.lineStrong }}>
          <T v="title" color={colors.ink}>→</T>
        </View>
      </View>
      <T v={featured ? 'h2' : 'h3'} color={featured ? colors.onInk : colors.ink}>{title}</T>
      <T v="small" color={featured ? '#D5DCCF' : colors.muted}>{body}</T>
      <T v="caption" color={featured ? colors.lime : tone === 'soft' ? colors.moss : colors.clay} style={{ fontFamily: 'InterTight_600SemiBold' }}>{gain}</T>
    </Pressable>
  );
}

export default function Fate() {
  const s = useStore();
  const scan = s.scan;
  if (!scan) return <Redirect href={HOME} />;
  const { avoided, water, bin, decompositionLabel } = scan.carbon;

  function trash() {
    s.complete('trash');
    router.replace({ pathname: '/result', params: { choice: 'trash' } });
  }

  return (
    <Screen>
      <TopBar label="Kader seçimi" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.gutter, paddingBottom: space.xxl, gap: 10 }}>
        <T v="h1">Bu eşyanın <Em size={34}>kaderi</Em> senin elinde.</T>
        <T v="body" color={colors.muted} style={{ marginBottom: space.md }}>Her yolun sonucunu simülasyonda göreceksin; adan da buna göre değişecek.</T>
        <Option tone="featured" n="01" title="Yeni hayat ver" body="Yapay zekâ bu eşyaya özel fikirler üretsin, adım adım anlatsın."
          gain={`+ çiçek · ${avoided.upcycleG} g CO₂e · ${water.savedUpcycleL.toLocaleString('tr-TR')} L su`} onPress={() => router.push('/upcycle')} />
        <Option tone="soft" n="02" title="Geri dönüştür" body={`${bin} kutuya; nasıl hazırlanacağını göstereceğiz.`}
          gain={`+ fidan · ${avoided.recycleG} g CO₂e · ${water.savedRecycleL.toLocaleString('tr-TR')} L su`} onPress={() => router.push('/recycle')} />
        <Option tone="outline" n="03" title="Çöpe at" body={`Yargı yok. Sadece ${decompositionLabel}lık yolculuğunu göstereceğiz.`}
          gain="Puan yok · adanın sahiline çöp gelir" onPress={trash} />
      </ScrollView>
    </Screen>
  );
}
