import React, { useEffect } from 'react';
import { StatusBar as RNStatusBar, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    // Hide top notification / status bar completely
    RNStatusBar.setHidden(true, 'none');
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar hidden={true} />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
