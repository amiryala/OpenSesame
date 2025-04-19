import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Surface, 
  Title, 
  Paragraph,
  HelperText
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';

type SetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Setup'>;

const SetupScreen: React.FC = () => {
  const { completeSetup, biometricType } = useAuth();
  const navigation = useNavigation<SetupScreenNavigationProp>();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    // Validate PIN
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Your PIN must be at least 4 digits');
      return;
    }

    // Check if PINs match
    if (pin !== confirmPin) {
      Alert.alert('PINs do not match', 'Please make sure your PINs match');
      return;
    }

    // Complete setup
    setLoading(true);
    const success = await completeSetup(pin);
    setLoading(false);

    if (!success) {
      Alert.alert('Setup Failed', 'There was an error during setup. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Surface style={styles.surface}>
          {/* Placeholder for logo */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🔐</Text>
          </View>
          
          <Title style={styles.title}>Welcome to OpenSesame</Title>
          
          <Paragraph style={styles.paragraph}>
            Let's set up your password manager. First, create a PIN that you'll use to access your passwords.
          </Paragraph>
          
          {biometricType !== 'NONE' && (
            <Paragraph style={styles.paragraph}>
              You'll also be able to use {biometricType === 'FACE_ID' ? 'Face ID' : 'Fingerprint'} to unlock the app.
            </Paragraph>
          )}
          
          <TextInput
            label="Create PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            style={styles.input}
            maxLength={8}
          />
          <HelperText type="info">PIN must be at least 4 digits</HelperText>
          
          <TextInput
            label="Confirm PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            secureTextEntry
            style={styles.input}
            maxLength={8}
          />
          
          <Button
            mode="contained"
            onPress={handleSetup}
            loading={loading}
            disabled={loading || pin.length < 4 || confirmPin.length < 4}
            style={styles.button}
          >
            Complete Setup
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    width: '100%',
  },
});

export default SetupScreen;