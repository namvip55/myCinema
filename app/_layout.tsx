import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { Colors } from '../constants/theme';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Giữ splash screen cho đến khi chúng ta điều hướng xong
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLocked, isFirstTime, lock } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Chỉ chạy khi navigation đã sẵn sàng
    if (!navigationState?.key) return;

    const inLockScreen = segments[0] === 'lock';
    const needsLock = isFirstTime || isLocked;

    // Use a small timeout to ensure the navigator is mounted
    const timer = setTimeout(() => {
      try {
        if (needsLock && !inLockScreen) {
          router.replace('/lock');
        } else if (!needsLock && inLockScreen) {
          router.replace('/(tabs)');
        }
        SplashScreen.hideAsync().catch(() => {});
      } catch (e) {
        console.warn('Navigation error in root layout:', e);
      }
    }, 1);

    return () => clearTimeout(timer);
  }, [isLocked, isFirstTime, segments, navigationState?.key]);

  // Tự động khóa khi vào background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        lock();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [lock]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="lock" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="player"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="playlist/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
