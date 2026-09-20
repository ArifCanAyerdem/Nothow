/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1a1c1a',
    textSecondary: '#5a4136',
    background: '#faf9f6',
    backgroundElement: '#ffffff',
    backgroundSelected: '#efeeeb',
    primary: '#a04100',
    primaryContainer: '#ff6b00',
    primaryFixed: '#ffdbcc',
    primaryFixedDim: '#ffb693',
    onPrimaryContainer: '#572000',
    onPrimaryFixed: '#351000',
    secondary: '#5e5e62',
    secondaryContainer: '#e3e2e6',
    tertiary: '#655d57',
    tertiaryContainer: '#a19790',
    surface: '#faf9f6',
    surfaceContainer: '#efeeeb',
    surfaceContainerLow: '#f4f3f0',
    surfaceContainerHigh: '#e9e8e5',
    surfaceContainerLowest: '#ffffff',
    border: '#e3e2df', // surface-variant
    success: '#059669', // emerald-600
    error: '#ba1a1a',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#a19790',
    background: '#121316',
    backgroundElement: '#1a1c1a',
    backgroundSelected: '#2f312f',
    primary: '#FF6B00',
    secondary: '#faf9f6',
    tertiary: '#a04100',
    border: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    error: '#ffb4ab',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
