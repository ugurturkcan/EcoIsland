import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, space, type, type TypeVariant } from '@/theme';
import { HOME } from '@/routes';

/** Tüm metinler bu bileşenle yazılır; varyant = tasarım sistemindeki yazı ölçeği. */
export function T({ v = 'body', color = colors.ink, style, ...rest }: TextProps & { v?: TypeVariant; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[type[v], { color }, style]} />;
}

/** Başlık içinde vurgu: aynı ailede, marka rengiyle. */
export function Em({ children, color = colors.moss, size }: { children: ReactNode; color?: string; size?: number }) {
  return <Text style={{ fontFamily: fonts.bold, color, fontSize: size }}>{children}</Text>;
}

export function Screen({ children, dark, edges = ['top', 'bottom'] }: { children: ReactNode; dark?: boolean; edges?: ('top' | 'bottom')[] }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: dark ? colors.ink : colors.paper }} edges={edges}>{children}</SafeAreaView>;
}

export function IconButton({ onPress, label, children, dark, style }: { onPress: () => void; label: string; children: ReactNode; dark?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6}
      style={({ pressed }) => [s.iconBtn, { backgroundColor: dark ? 'rgba(242,238,229,0.08)' : colors.paperRaised, borderColor: dark ? '#3A4540' : colors.line, opacity: pressed ? 0.7 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

export function Chevron({ dir = 'left', color = colors.ink }: { dir?: 'left' | 'down'; color?: string }) {
  return <Text style={{ fontFamily: fonts.medium, fontSize: 22, lineHeight: 24, color, transform: [{ rotate: dir === 'down' ? '-90deg' : '0deg' }] }}>‹</Text>;
}

export function TopBar({ label, dark, close }: { label?: string; dark?: boolean; close?: boolean }) {
  const back = () => (router.canGoBack() ? router.back() : router.replace(HOME));
  return (
    <View style={s.top}>
      <IconButton label={close ? 'Kapat' : 'Geri'} onPress={back} dark={dark}>
        {close ? <T v="title" color={dark ? colors.onInk : colors.ink}>✕</T> : <Chevron color={dark ? colors.onInk : colors.ink} />}
      </IconButton>
      {label ? <T v="label" color={dark ? colors.onInkMuted : colors.muted}>{label}</T> : <View />}
      <View style={{ width: 44 }} />
    </View>
  );
}

export function PrimaryButton({ title, onPress, disabled, loading, icon = '→' }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean; icon?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled, busy: !!loading }} disabled={disabled || loading}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress(); }}
      style={({ pressed }) => [s.primary, { opacity: disabled ? 0.4 : pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
      <T v="button" color={colors.onInk}>{title}</T>
      <View style={s.primaryDot}>{loading ? <ActivityIndicator color={colors.ink} /> : <T v="h3" color={colors.ink}>{icon}</T>}</View>
    </Pressable>
  );
}

export function Footer({ children }: { children: ReactNode }) {
  return <View style={s.footer}>{children}</View>;
}

export function Pill({ children, bg = 'transparent', color = colors.ink, border }: { children: ReactNode; bg?: string; color?: string; border?: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, borderWidth: border ? 1 : 0, borderColor: border }}>
      <T v="caption" color={color} style={{ fontFamily: fonts.medium }}>{children}</T>
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.err}>
      <T v="small" color={colors.clay}>{message}</T>
      {onRetry && (
        <Pressable accessibilityRole="button" onPress={onRetry} style={{ marginTop: space.sm, minHeight: 44, justifyContent: 'center' }}>
          <T v="title">Tekrar dene</T>
        </Pressable>
      )}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.line }, style]} />;
}

export function Progress({ value, color = colors.moss, track = colors.line }: { value: number; color?: string; track?: string }) {
  return (
    <View style={{ height: 6, backgroundColor: track, borderRadius: 3, overflow: 'hidden' }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: 6, backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

export const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.gutter, paddingTop: space.sm, paddingBottom: space.sm },
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  primary: { height: 60, borderRadius: radius.pill, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 8 },
  primaryDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: space.gutter, paddingTop: space.md, paddingBottom: space.sm, backgroundColor: colors.paper },
  err: { backgroundColor: colors.claySoft, borderRadius: radius.md, padding: 14, marginHorizontal: space.gutter, marginTop: space.md },
  card: { backgroundColor: colors.sand, borderRadius: radius.lg, padding: space.lg },
  content: { paddingHorizontal: space.gutter, paddingBottom: space.xxl },
});
