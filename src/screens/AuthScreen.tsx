import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Surface, 
  Title,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
  const { authenticateWithBiometrics, authenticateWithPIN, biometricType } = useAuth();
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricFailed, setBiometricFailed] = useState(false);

  // Try biometric authentication on load
  useEffect(() => {
    if (biometricType !== 'NONE') {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);
    const result = await authenticateWithBiometrics();
    setLoading(false);
    
    if (!result.success && !result.cancelled) {
      setBiometricFailed(true);
      Alert.alert(
        'Authentication Failed',
        'Please try again or use your PIN to unlock.'
      );
    }
  };

  const handlePinAuth = async () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter your PIN');
      return;
    }
    
    setLoading(true);
    const success = await authenticateWithPIN(pin);
    setLoading(false);
    
    if (!success) {
      Alert.alert('Authentication Failed', 'Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Surface style={styles.surface}>
        {/* Placeholder for logo */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>🔐</Text>
        </View>
        
        <Title style={styles.title}>OpenSesame</Title>
        
        <TextInput
          label="Enter PIN"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          style={styles.input}
          maxLength={8}
          disabled={loading}
        />
        
        <Button
          mode="contained"
          onPress={handlePinAuth}
          loading={loading}
          disabled={loading || pin.length < 4}
          style={styles.button}
        >
          Unlock
        </Button>
        
        {biometricType !== 'NONE' && biometricFailed && (
          <Button
            mode="outlined"
            onPress={handleBiometricAuth}
            disabled={loading}
            style={styles.button}
            icon={biometricType === 'FACE_ID' ? 'face-recognition' : 'fingerprint'}
          >
            Use {biometricType === 'FACE_ID' ? 'Face ID' : 'Fingerprint'}
          </Button>
        )}
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4a148c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    width: '100%',
  },
});

export default AuthScreen;