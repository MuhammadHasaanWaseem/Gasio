import { UserProvider } from '@/context/usercontext';
import { VendorProvider } from '@/context/vendorcontext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../context/authcontext';




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
                  <Stack.Screen name="vendormessage" options={{ headerShown: false, animation: 'slide_from_right' }} />
                  <Stack.Screen name="chat" options={{ headerShown: false, animation: 'slide_from_right' }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </>
            </ActionSheetProvider>
          </ThemeProvider>
        </VendorProvider>
      </UserProvider>
    </AuthProvider>
  );
}
