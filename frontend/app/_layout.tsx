import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Pressable, View } from 'react-native'; // Import View for styling container

import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol'; // Import IconSymbol
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter(); // Initialize useRouter
  const segments = useSegments();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0] as string;
    const inAuthGroup = currentSegment === 'login' || currentSegment === 'register';

    if (!user && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (user && inAuthGroup) {
      router.replace('/' as any);
    }
  }, [user, loading, segments, router]);

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen
            name="movie/[id]"
            options={{
              headerShown: true, // Show header
              headerTransparent: true, // Make header transparent
              headerTitle: '', // Hide header title
              headerLeft: () => (
                <Pressable onPress={() => router.back()} style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent
                  marginLeft: 16, // Adjust position
                  marginTop: 8, // Adjust position to be a bit lower
                }}>
                  <IconSymbol size={20} name="chevron.left" color="#EDEDED" />
                </Pressable>
              ),
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
