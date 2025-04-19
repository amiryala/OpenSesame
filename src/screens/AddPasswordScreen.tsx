import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Surface, 
  Title, 
  HelperText
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePasswords } from '../contexts/PasswordContext';
import { RootStackParamList } from '../types';

type AddPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPassword'>;
type AddPasswordRouteProp = RouteProp<RootStackParamList, 'AddPassword'>;

const AddPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AddPasswordNavigationProp>();
  const route = useRoute<AddPasswordRouteProp>();
  const { addPassword, updatePassword } = usePasswords();
  
  // Check if we're editing an existing password
  const existingPassword = route.params?.password;
  const isEditing = !!existingPassword;
  
  // Form state
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Fill form with existing data if editing
  useEffect(() => {
    if (existingPassword) {
      setTitle(existingPassword.title);
      setUsername(existingPassword.username);
      setPassword(existingPassword.password);
      setUrl(existingPassword.url || '');
      setNotes(existingPassword.notes || '');
    }
  }, [existingPassword]);
  
  // Form validation
  const [errors, setErrors] = useState<{
    title?: string;
    password?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: {
      title?: string;
      password?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const passwordData = {
      title: title.trim(),
      username: username.trim(),
      password: password,
      url: url.trim(),
      notes: notes.trim(),
    };
    
    let success;
    
    if (isEditing && existingPassword) {
      success = await updatePassword({
        ...passwordData,
        id: existingPassword.id,
        createdAt: existingPassword.createdAt,
      });
    } else {
      success = await addPassword(passwordData);
    }
    
    setLoading(false);
    
    if (success) {
      navigation.goBack();
    } else {
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'save'} password. Please try again.`
      );
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface}>
          <Title style={styles.title}>
            {isEditing ? 'Edit Password' : 'Add Password'}
          </Title>
          
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            error={!!errors.title}
          />
          {errors.title && <HelperText type="error">{errors.title}</HelperText>}
          
          <TextInput
            label="Username / Email"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              style={[styles.input, { flex: 1 }]}
              error={!!errors.password}
            />
            <Button
              icon={passwordVisible ? "eye-off" : "eye"}
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.visibilityButton}
            >
              {passwordVisible ? "Hide" : "Show"}
            </Button>
          </View>
          {errors.password && <HelperText type="error">{errors.password}</HelperText>}
          
          <TextInput
            label="Website / App URL"
            value={url}
            onChangeText={setUrl}
            style={styles.input}
          />
          
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            style={styles.input}
            multiline
            numberOfLines={4}
          />
          
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            {isEditing ? 'Update' : 'Save'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={loading}
          >
            Cancel
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
  scrollContent: {
    padding: 16,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityButton: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default AddPasswordScreen;