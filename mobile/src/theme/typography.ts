import { TextStyle } from 'react-native';

import { colors } from './colors';

const family = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
} as const;

type TypographyKey = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';

export const typography: Record<TypographyKey, TextStyle> = {
  h1: { fontFamily: family.medium, fontSize: 22, color: colors.textPrimary },
  h2: { fontFamily: family.medium, fontSize: 18, color: colors.textPrimary },
  h3: { fontFamily: family.medium, fontSize: 16, color: colors.textPrimary },
  body: { fontFamily: family.regular, fontSize: 14, color: colors.textPrimary },
  small: { fontFamily: family.regular, fontSize: 12, color: colors.textSecondary },
  caption: { fontFamily: family.medium, fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5 },
};

export const fontFamily = family;
