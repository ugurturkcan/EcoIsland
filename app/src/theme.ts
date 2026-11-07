// Adacık tasarım sistemi — tasarım prototipindeki "Marka kimliği" panosuyla birebir.
import type { TextStyle } from 'react-native';

export const colors = {
  paper: '#F2EEE5',
  paperRaised: '#F8F5EE',
  sand: '#E8E2D4',
  line: '#D9D2C2',
  lineStrong: '#C9C0AC',
  ink: '#18201B',
  inkSoft: '#3F4741',
  muted: '#5E655F',
  moss: '#2F4A2A',
  mossSoft: '#5C7A47',
  lime: '#D4E39A',
  sky: '#CDE8F2',
  skyInk: '#1F5B73',
  water: '#2C7DA0',
  clay: '#8A3D24',
  claySoft: '#F6E3DC',
  yellow: '#F3D96B',
  onInk: '#F2EEE5',
  onInkMuted: '#C3CAC5',
};

export const fonts = {
  regular: 'InterTight_400Regular',
  medium: 'InterTight_500Medium',
  semibold: 'InterTight_600SemiBold',
  bold: 'InterTight_700Bold',
  // Modern, tek aileli tipografi: birim ve vurgular da Inter Tight (eski serif/mono yerine).
  serif: 'InterTight_500Medium',
  mono: 'InterTight_600SemiBold',
};

// Yazı ölçeği: tüm metinler bu varyantlardan biriyle yazılır.
export const type = {
  display: { fontFamily: fonts.bold, fontSize: 52, lineHeight: 56, letterSpacing: -2 },
  h1: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 37, letterSpacing: -1 },
  h2: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 29, letterSpacing: -0.6 },
  h3: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 24, letterSpacing: -0.3 },
  title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20, letterSpacing: -0.1 },
  tab: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, gutter: 20 };
export const radius = { sm: 12, md: 18, lg: 24, xl: 30, pill: 999 };
