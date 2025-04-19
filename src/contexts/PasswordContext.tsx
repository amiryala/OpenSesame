import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { PasswordContextType, PasswordEntry } from '../types';
import { useAuth } from './AuthContext';

// Prefix for password entries in secure storage
const PASSWORD_KEY_PREFIX = 'opensesame_pwd_';
// Key for storing the list of password IDs
const PASSWORD_LIST_KEY = 'opensesame_pwd_list';

// Create the context with a default value
const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

// Custom hook to use the passwords context
export const usePasswords = (): PasswordContextType => {
  const context = useContext(PasswordContext);
  if (!context) {
    throw new Error('usePasswords must be used within a PasswordProvider');
  }
  return context;
};

export const PasswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load passwords when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPasswords();
    } else {
      // Clear passwords when logged out
      setPasswords([]);
    }
  }, [isAuthenticated]);

  // Load all saved passwords
  const loadPasswords = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Get the list of password IDs
      const passwordListJson = await SecureStore.getItemAsync(PASSWORD_LIST_KEY);
      const passwordList: string[] = passwordListJson ? JSON.parse(passwordListJson) : [];
      
      // Load each password entry
      const loadedPasswords: PasswordEntry[] = [];
      for (const id of passwordList) {
        const passwordJson = await SecureStore.getItemAsync(`${PASSWORD_KEY_PREFIX}${id}`);
        if (passwordJson) {
          loadedPasswords.push(JSON.parse(passwordJson));
        }
      }
      
      setPasswords(loadedPasswords);
    } catch (error) {
      console.error('Error loading passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new password
  const addPassword = async (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      // Generate a unique ID
      const id = Date.now().toString();
      const newPassword: PasswordEntry = { 
        ...passwordData, 
        id, 
        createdAt: new Date().toISOString() 
      };
      
      // Save to secure storage
      await SecureStore.setItemAsync(
        `${PASSWORD_KEY_PREFIX}${id}`,
        JSON.stringify(newPassword)
      );
      
      // Update the password list
      const passwordListJson = await SecureStore.getItemAsync(PASSWORD_LIST_KEY);
      const passwordList: string[] = passwordListJson ? JSON.parse(passwordListJson) : [];
      passwordList.push(id);
      await SecureStore.setItemAsync(PASSWORD_LIST_KEY, JSON.stringify(passwordList));
      
      // Update state
      setPasswords(prev => [...prev, newPassword]);
      return true;
    } catch (error) {
      console.error('Error adding password:', error);
      return false;
    }
  };

  // Update an existing password
  const updatePassword = async (updatedPassword: PasswordEntry): Promise<boolean> => {
    try {
      // Save to secure storage
      const passwordToSave = {
        ...updatedPassword,
        updatedAt: new Date().toISOString()
      };
      
      await SecureStore.setItemAsync(
        `${PASSWORD_KEY_PREFIX}${updatedPassword.id}`,
        JSON.stringify(passwordToSave)
      );
      
      // Update state
      setPasswords(prev => 
        prev.map(pwd => pwd.id === updatedPassword.id ? {
          ...updatedPassword,
          updatedAt: new Date().toISOString()
        } : pwd)
      );
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  };

  // Delete a password
  const deletePassword = async (id: string): Promise<boolean> => {
    try {
      // Delete from secure storage
      await SecureStore.deleteItemAsync(`${PASSWORD_KEY_PREFIX}${id}`);
      
      // Update the password list
      const passwordListJson = await SecureStore.getItemAsync(PASSWORD_LIST_KEY);
      const passwordList: string[] = passwordListJson ? JSON.parse(passwordListJson) : [];
      const updatedList = passwordList.filter(pwdId => pwdId !== id);
      await SecureStore.setItemAsync(PASSWORD_LIST_KEY, JSON.stringify(updatedList));
      
      // Update state
      setPasswords(prev => prev.filter(pwd => pwd.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting password:', error);
      return false;
    }
  };

  // Create the context value
  const value: PasswordContextType = {
    passwords,
    loading,
    addPassword,
    updatePassword,
    deletePassword,
    refreshPasswords: loadPasswords,
  };

  return (
    <PasswordContext.Provider value={value}>
      {children}
    </PasswordContext.Provider>
  );
};