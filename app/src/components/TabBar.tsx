import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T } from '@/components/ui';
import { useStore } from '@/store';
import { colors } from '@/theme';

function IslandIcon({ color }: { color: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d="M3 15l9-5 9 5-9 5z" /><Path d="M12 10V4l4 3" /></Svg>;
}
function ImpactIcon({ color }: { color: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d="M4 20V10" /><Path d="M10 20V4" /><Path d="M16 20v-7" /><Path d="M21 20H3" /></Svg>;
}
function ProfileIcon({ color }: { color: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Circle cx={12} cy={8} r={4} /><Path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></Svg>;
}
function CameraIcon() {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M4 8h3l2-3h6l2 3h3v11H4z" /><Circle cx={12} cy={13} r={3.5} /></Svg>;
}

const ITEMS: Record<string, { label: string; Icon: typeof IslandIcon }> = {
  index: { label: 'Ada', Icon: IslandIcon },
  impact: { label: 'Etki', Icon: ImpactIcon },
  profile: { label: 'Profil', Icon: ProfileIcon },
};

/** Yüzen alt menü: Ada · Etki · [Ekle] · Profil. Lime buton yeni eşya ekleme akışını alttan açar. */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const resetFlow = useStore((s) => s.resetFlow);

  const tab = (routeIndex: number) => {
    const route = state.routes[routeIndex];
    if (!route) return null;
    const focused = state.index === routeIndex;
    const meta = ITEMS[route.name] ?? { label: route.name, Icon: IslandIcon };
    const color = focused ? colors.onInk : '#8F9891';
    return (
      <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={meta.label}
        onPress={() => {
          if (!focused) { Haptics.selectionAsync().catch(() => {}); navigateToTab(route.key); }
        }}
        style={st.tab}>
        <meta.Icon color={color} />
        <T v="tab" color={color}>{meta.label}</T>
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={[st.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={st.bar}>
        {tab(0)}
        {tab(1)}
        <Pressable accessibilityRole="button" accessibilityLabel="Yeni eşya ekle" accessibilityHint="Kamerayı açar"
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); resetFlow(); router.push({ pathname: '/camera', params: { mode: 'identify' } }); }}
          style={({ pressed }) => [st.add, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
          <CameraIcon />
        </Pressable>
        {tab(2)}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 10, height: 68, width: 344, justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 10 },
  tab: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
  add: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
});
