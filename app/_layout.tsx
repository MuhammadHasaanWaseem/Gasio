import { UserProvider } from '@/context/usercontext';
import { VendorProvider } from '@/context/vendorcontext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../context/authcontext';

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <VendorProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <ActionSheetProvider>
              <QueryClientProvider client={queryClient}>
                <>
                  <StatusBar style="auto" />
                  <Stack initialRouteName='(auth)' screenOptions={{ headerShown: false }}>
                    <Stack.Screen name='splash' options={{ headerShown: false }} />
                    <Stack.Screen name='onboarding' options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="(Vendortab)" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="Vendordrawer" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="(drawer)" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="createservice" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="(Edrawer)" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name='(Shared)' options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="bookservice" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="orderdetail" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="LeaveReview" options={{ headerShown: false, animation: 'slide_from_right' }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </>
              </QueryClientProvider>
            </ActionSheetProvider>
          </ThemeProvider>
        </VendorProvider>
      </UserProvider>
    </AuthProvider>
  );
}
