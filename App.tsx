import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { PasswordProvider } from './src/contexts/PasswordContext';

// Create a custom theme with Open Sesame colors
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4a148c', // Deep purple
    accent: '#f50057',  // Pink
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="light" />
          <AuthProvider>
            <PasswordProvider>
              <RootNavigator />
            </PasswordProvider>
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}