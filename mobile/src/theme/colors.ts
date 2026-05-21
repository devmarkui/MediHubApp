export const colors = {
  emerald: '#10B981',
  brandTeal: '#2DD4BF',
  skyBlue: '#38BDF8',
  deepTeal: '#134E4A',
  darkTeal: '#0F766E',
  surface: '#FFFFFF',
  surfaceTint: '#F8FAFC',
  mintTint: '#ECFEFF',
  greenTint: '#F0FDF4',
  blueTint: '#EFF6FF',
  amberTint: '#FEF3C7',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#B45309',
  danger: '#EF4444',
  info: '#0284C7',
} as const;

export type ColorName = keyof typeof colors;
