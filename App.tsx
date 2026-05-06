import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import RootTabNavigator from './src/navigation/RootTabNavigator';
import { useAuthStore } from './src/services/auth/authStore';
import { useSignalsStore } from './src/services/signals/signalsStore';
import { useMonetizationStore } from './src/services/monetization/monetizationStore';
import { logger } from './src/utils/logger';

export default function App() {
  const initializeAuth = useAuthStore(s => s.initialize);
  const syncOnAppOpen = useSignalsStore(s => s.syncOnAppOpen);
  const initializeMonetization = useMonetizationStore(s => s.initialize);

  useEffect(() => {
    async function bootstrap() {
      try {
        await Promise.all([initializeAuth(), syncOnAppOpen(), initializeMonetization()]);
        logger.info('App bootstrap complete');
      } catch (err) {
        logger.error('App bootstrap failed', err);
      }
    }

    bootstrap();

    // Sync signals whenever app returns to foreground
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        syncOnAppOpen();
      }
    });

    return () => subscription.remove();
  }, [initializeAuth, syncOnAppOpen, initializeMonetization]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootTabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
