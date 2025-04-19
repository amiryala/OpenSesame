import React, { createContext, useState, useContext, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { AuthContextType, BiometricType } from '../types';

// Keys for secure storage
const PIN_KEY = 'opensesame_pin';
const HAS_SETUP_KEY = 'opensesame_setup_complete';

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSetup, setHasSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [biometricType, setBiometricType] = useState<BiometricType>('NONE');

  // Check if setup is complete and what biometric options are available
  useEffect(() => {
    const checkSetupAndBiometrics = async () => {
      try {
        // Check if setup is complete
        const setupComplete = await SecureStore.getItemAsync(HAS_SETUP_KEY);
        setHasSetup(setupComplete === 'true');

        // Check available biometric authentication
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        
        if (hasHardware) {
          const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
          
          if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('FACE_ID');
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('FINGERPRINT');
          } else {
            setBiometricType('NONE');
          }
        } else {
          setBiometricType('NONE');
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
        setBiometricType('NONE');
      } finally {
        setLoading(false);
      }
    };

    checkSetupAndBiometrics();
  }, []);

  // Complete initial setup
  const completeSetup = async (pin: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(PIN_KEY, pin);
      await SecureStore.setItemAsync(HAS_SETUP_KEY, 'true');
      setHasSetup(true);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error completing setup:', error);
      return false;
    }
  };

  // Authenticate with biometrics
  const authenticateWithBiometrics = async (): Promise<{ success: boolean; error?: string; cancelled?: boolean }> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your passwords',
        fallbackLabel: 'Use PIN instead',
      });

      if (result.success) {
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Authentication failed', 
        cancelled: result.error === 'user_cancel'
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Authenticate with PIN
  const authenticateWithPIN = async (pin: string): Promise<boolean> => {
    try {
      const storedPIN = await SecureStore.getItemAsync(PIN_KEY);
      
      if (pin === storedPIN) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PIN authentication error:', error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
  };

  // Create the context value
  const value: AuthContextType = {
    isAuthenticated,
    hasSetup,
    loading,
    biometricType,
    completeSetup,
    authenticateWithBiometrics,
    authenticateWithPIN,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};