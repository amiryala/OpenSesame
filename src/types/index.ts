// Authentication types
export type BiometricType = 'FACE_ID' | 'FINGERPRINT' | 'NONE';

export interface AuthContextType {
  isAuthenticated: boolean;
  hasSetup: boolean;
  loading: boolean;
  biometricType: BiometricType;
  completeSetup: (pin: string) => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<{ success: boolean; error?: string; cancelled?: boolean }>;
  authenticateWithPIN: (pin: string) => Promise<boolean>;
  logout: () => void;
}

// Password types
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PasswordContextType {
  passwords: PasswordEntry[];
  loading: boolean;
  addPassword: (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updatePassword: (updatedPassword: PasswordEntry) => Promise<boolean>;
  deletePassword: (id: string) => Promise<boolean>;
  refreshPasswords: () => Promise<void>;
}

// Navigation types
export type RootStackParamList = {
  Setup: undefined;
  Auth: undefined;
  Home: undefined;
  AddPassword: { password?: PasswordEntry };
  PasswordDetail: { id: string };
};