export const palette = {
  ink900: '#12131A',
  ink800: '#1B1D27',
  ink700: '#262837',
  indigo600: '#4A47A3',
  indigo500: '#5D5AC0',
  indigo400: '#7A77D6',
  amber500: '#F2A93B',
  amber400: '#F5BC63',
  emerald500: '#2FB574',
  rose500: '#E45A5A',
  gray50: '#F7F7F9',
  gray100: '#EEEEF2',
  gray200: '#DEDEE5',
  gray400: '#9C9CA8',
  gray500: '#7A7A87',
  gray700: '#4B4B57',
  white: '#FFFFFF',
};

export const lightTheme = {
  mode: 'light' as const,
  background: palette.gray50,
  surface: palette.white,
  surfaceAlt: palette.gray100,
  border: palette.gray200,
  textPrimary: palette.ink900,
  textSecondary: palette.gray500,
  primary: palette.indigo600,
  primaryText: palette.white,
  accent: palette.amber500,
  success: palette.emerald500,
  danger: palette.rose500,
};

export const darkTheme = {
  mode: 'dark' as const,
  background: palette.ink900,
  surface: palette.ink800,
  surfaceAlt: palette.ink700,
  border: palette.ink700,
  textPrimary: palette.gray50,
  textSecondary: palette.gray400,
  primary: palette.indigo400,
  primaryText: palette.ink900,
  accent: palette.amber400,
  success: palette.emerald500,
  danger: palette.rose500,
};

export type Theme = typeof lightTheme;