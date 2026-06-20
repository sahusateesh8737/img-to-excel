import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { theme as appTheme } from '../theme/theme';

const m3Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: appTheme.colors.primary,
    onPrimary: appTheme.colors.onPrimary,
    primaryContainer: appTheme.colors.primaryContainer,
    onPrimaryContainer: appTheme.colors.onPrimaryContainer,
    secondary: appTheme.colors.secondary,
    onSecondary: appTheme.colors.onSecondary,
    secondaryContainer: appTheme.colors.secondaryContainer,
    onSecondaryContainer: appTheme.colors.onSecondaryContainer,
    error: appTheme.colors.error,
    onError: appTheme.colors.onError,
    background: appTheme.colors.background,
    onBackground: appTheme.colors.onBackground,
    surface: appTheme.colors.surface,
    onSurface: appTheme.colors.onSurface,
    surfaceVariant: appTheme.colors.surfaceVariant,
    onSurfaceVariant: appTheme.colors.onSurfaceVariant,
    outline: appTheme.colors.outline,
    outlineVariant: appTheme.colors.outlineVariant,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={m3Theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="crop" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="converting" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
