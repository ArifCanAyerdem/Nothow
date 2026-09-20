import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { useVaultStore } from '@/store/vaultStore';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { lockVault, isUnlocked } = useVaultStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    SplashScreen.hideAsync();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // If going to background or inactive, and vault is unlocked
      if (
        appState.current.match(/active/) &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        if (useVaultStore.getState().isUnlocked) {
          lockVault();
          router.replace('/login');
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
