import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Share,
  Alert,
  Clipboard,
  Platform,
} from 'react-native';
import { 
  Text, 
  Surface, 
  Title, 
  Caption, 
  Button, 
  IconButton 
} from 'react-native-paper';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring
} from 'react-native-reanimated';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePasswords } from '../contexts/PasswordContext';
import { PasswordEntry, RootStackParamList } from '../types';

type PasswordDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PasswordDetail'>;
type PasswordDetailRouteProp = RouteProp<RootStackParamList, 'PasswordDetail'>;

const PasswordDetailScreen: React.FC = () => {
  const route = useRoute<PasswordDetailRouteProp>();
  const navigation = useNavigation<PasswordDetailNavigationProp>();
  const { id } = route.params;
  const { passwords, deletePassword } = usePasswords();
  const [passwordEntry, setPasswordEntry] = useState<PasswordEntry | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Door animation values
  const doorRotation = useSharedValue(0);
  
  // Find the password entry
  useEffect(() => {
    const entry = passwords.find(item => item.id === id);
    if (entry) {
      setPasswordEntry(entry);
    } else {
      // Password not found, go back
      Alert.alert('Error', 'Password not found');
      navigation.goBack();
    }
  }, [id, passwords]);

  // Toggle password visibility with animation
  const togglePasswordVisibility = () => {
    // Door opening animation
    doorRotation.value = withSpring(
      isPasswordVisible ? 0 : -85, 
      { 
        damping: 10,
        stiffness: 80,
        mass: 1
      }
    );
    
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  // Door animation style
  const doorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 500 },
        { rotateY: `${doorRotation.value}deg` },
        { translateX: -20 } // Adjust this for hinge position
      ],
    };
  });

  // Copy password to clipboard
  const copyToClipboard = async (text: string) => {
    await Clipboard.setString(text);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  // Share password
  const handleShare = async () => {
    if (!passwordEntry) return;
    
    try {
      await Share.share({
        message: `Site/App: ${passwordEntry.title}\nUsername: ${passwordEntry.username}\nPassword: ${passwordEntry.password}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share password');
    }
  };

  // Delete password
  const handleDelete = () => {
    Alert.alert(
      'Delete Password',
      'Are you sure you want to delete this password?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePassword(id);
            if (success) {
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete password');
            }
          },
        },
      ]
    );
  };

  // Edit password
  const handleEdit = () => {
    if (passwordEntry) {
      navigation.navigate('AddPassword', { password: passwordEntry });
    }
  };

  if (!passwordEntry) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Title style={styles.title}>{passwordEntry.title}</Title>
        {passwordEntry.url && (
          <Caption style={styles.subtitle}>{passwordEntry.url}</Caption>
        )}
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Username:</Text>
          <Text style={styles.fieldValue}>{passwordEntry.username || 'Not set'}</Text>
          <IconButton
            icon="content-copy"
            size={20}
            onPress={() => copyToClipboard(passwordEntry.username)}
          />
        </View>
        
        <View style={styles.passwordSection}>
          <Text style={styles.fieldLabel}>Password:</Text>
          
          <View style={styles.doorContainer}>
            {/* Password Vault Door Animation */}
            <View style={styles.doorFrame}>
              <Animated.View style={[styles.door, doorStyle]}>
                <View style={styles.doorHandle} />
                <Text style={styles.doorText}>OPEN</Text>
              </Animated.View>
              
              <View style={styles.passwordContent}>
                <Text style={styles.passwordText}>
                  {isPasswordVisible ? passwordEntry.password : '••••••••••'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.revealButton}
              onPress={togglePasswordVisibility}
            >
              <Text style={styles.revealButtonText}>
                {isPasswordVisible ? 'HIDE' : 'REVEAL'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {passwordEntry.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.fieldLabel}>Notes:</Text>
            <Text style={styles.notesText}>{passwordEntry.notes}</Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={handleEdit}
            style={styles.actionButton}
          >
            Edit
          </Button>
          
          <Button
            mode="outlined"
            icon="share-variant"
            onPress={handleShare}
            style={styles.actionButton}
          >
            Share
          </Button>
          
          <Button
            mode="outlined"
            icon="delete"
            onPress={handleDelete}
            style={[styles.actionButton, styles.deleteButton]}
            color="#f44336"
          >
            Delete
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldLabel: {
    fontWeight: 'bold',
    width: 100,
  },
  fieldValue: {
    flex: 1,
  },
  passwordSection: {
    marginBottom: 16,
  },
  doorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  doorFrame: {
    width: 200,
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  door: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#4a148c',
    borderRadius: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
    // For shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  doorHandle: {
    width: 10,
    height: 10,
    backgroundColor: '#ffd700',
    borderRadius: 5,
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -5,
  },
  doorText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  passwordContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordText: {
    fontWeight: 'bold',
  },
  revealButton: {
    marginLeft: 16,
    backgroundColor: '#4a148c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  revealButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesText: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
});

export default PasswordDetailScreen;