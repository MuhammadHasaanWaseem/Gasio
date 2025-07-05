import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { AuthProvider } from '@/context/authcontext';
import { UserProvider } from '@/context/usercontext';
import { VendorProvider } from '@/context/vendorcontext';
import { useColorScheme } from '@/hooks/useColorScheme';
import OnboardingScreen from './onboarding';

SplashScreen.preventAutoHideAsync(); // Ensure splash stays until fonts + onboarding check complete

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStarter, setShowStarter] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Onboarding + Splash logic
  useEffect(() => {
    const prepare = async () => {
      if (!fontsLoaded) return;

      try {
        const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
        setShowOnboarding(completed !== 'true');
        setShowStarter(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); // optional 2s fake splash
      } catch (e) {
        console.error('Failed to load onboarding status', e);
      } finally {
        setShowStarter(false);
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, [fontsLoaded]);

  // Keep all hooks at the top — safe to render below

  //  Still loading: fonts or onboarding check
  if (!fontsLoaded || !isReady) {
    return null;
  }

  //  Optional: fake starter screen (2 seconds)
  if (showStarter) {
    return null; // or render <SplashAnimation />
  }

  //  Show onboarding if not completed
  if (showOnboarding) {
    return <OnboardingScreen onDone={async () => {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setShowOnboarding(false);
    }} />;
  }

  // ✅ Main App Render
  return (
    <AuthProvider>
      <UserProvider>
        <VendorProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <ActionSheetProvider>
              <QueryClientProvider client={queryClient}>
                <StatusBar style="auto" />
                <Stack initialRouteName='(auth)' screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="splash" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="(Vendortab)" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="(tabs)" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="Vendordrawer" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="(drawer)" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="createservice" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="(Edrawer)" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="(Shared)" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="bookservice" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="orderdetail" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="LeaveReview" options={{ animation: 'slide_from_right' }} />                
                                 

               <Stack.Screen name="+not-found" />
                </Stack>
              </QueryClientProvider>
            </ActionSheetProvider>
          </ThemeProvider>
        </VendorProvider>
      </UserProvider>
    </AuthProvider>
  );
}
