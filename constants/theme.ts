// MyCinema — Dark Cinema Theme
export const Colors = {
  // Backgrounds
  bg: '#0A0A1A',
  bgCard: '#14142B',
  bgElevated: '#1E1E3A',
  bgOverlay: 'rgba(10, 10, 26, 0.85)',

  // Primary (Purple)
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  primaryGlow: 'rgba(139, 92, 246, 0.3)',

  // Accent (Gold — highlights)
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentGlow: 'rgba(245, 158, 11, 0.4)',

  // Text
  text: '#F1F1F8',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  // Danger
  danger: '#EF4444',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',

  // Success
  success: '#10B981',

  // Borders
  border: '#2A2A4A',
  borderLight: '#3A3A5A',

  // Gradients
  gradientPurple: ['#7C3AED', '#8B5CF6', '#A78BFA'] as const,
  gradientDark: ['#0A0A1A', '#14142B', '#1E1E3A'] as const,
  gradientCard: ['rgba(20, 20, 43, 0.9)', 'rgba(30, 30, 58, 0.7)'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  title: 28,
  hero: 34,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  }),
};
