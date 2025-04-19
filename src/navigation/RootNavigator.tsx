import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import SetupScreen from '../screens/SetupScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import AddPasswordScreen from '../screens/AddPasswordScreen';
import PasswordDetailScreen from '../screens/PasswordDetailScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, hasSetup, loading } = useAuth();

  if (loading) {
    // If still loading auth state, return null or a loading screen
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4a148c',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!hasSetup ? (
        // Setup flow
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen}
          options={{ title: 'Welcome to OpenSesame' }}
        />
      ) : !isAuthenticated ? (
        // Authentication flow
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      ) : (
        // Main app flow
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Passwords' }}
          />
          <Stack.Screen 
            name="AddPassword" 
            component={AddPasswordScreen}
            options={({ route }) => ({ 
              title: route.params?.password ? 'Edit Password' : 'Add Password'
            })}
          />
          <Stack.Screen 
            name="PasswordDetail" 
            component={PasswordDetailScreen}
            options={{ title: 'Password Details' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};