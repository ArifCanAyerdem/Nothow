import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import { setupNotifications } from '@/utils/notifications';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { lockVault, initStore } = useVaultStore();
  const appState = useRef(AppState.currentState);
  const backgroundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function prepareApp() {
      // Setup notification permissions
      await setupNotifications();
      // Initialize the database and SecureStore
      await initStore();
      
      SplashScreen.hideAsync();
    }
    
    prepareApp();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Going to background
      if (
        appState.current.match(/active/) &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        if (useVaultStore.getState().isUnlocked) {
          const timerDuration = useVaultStore.getState().autoLockTimer;
          
          if (timerDuration === 0) {
            lockVault();
            router.replace('/login');
          } else {
            backgroundTimer.current = setTimeout(() => {
              lockVault();
            }, timerDuration);
          }
        }
      }

      // Coming back to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (backgroundTimer.current) {
          clearTimeout(backgroundTimer.current);
          backgroundTimer.current = null;
        }
        
        if (!useVaultStore.getState().isUnlocked) {
          router.replace('/login');
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (backgroundTimer.current) clearTimeout(backgroundTimer.current);
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </ThemeProvider>
  );
}
