
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  userType: 'user' | 'vendor' | null;
  isLoggedIn: boolean;
  loginAsUser: () => void;
  loginAsVendor: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<'user' | 'vendor' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check login status from AsyncStorage here
    const checkLoginStatus = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('userType');
        if (storedUserType === 'user') {
          setUserType('user');
          setIsLoggedIn(true);
          router.replace('/(tabs)');
        } else if (storedUserType === 'vendor') {
          setUserType('vendor');
          setIsLoggedIn(true);
          router.replace('/(Vendortab)');
        } else {
          setUserType(null);
          setIsLoggedIn(false);
          router.replace('/login');
        }
      } catch (error) {
        setUserType(null);
        setIsLoggedIn(false);
        router.replace('/login');
      }
    };
    checkLoginStatus();
  }, []);

  const loginAsUser = async () => {
    setUserType('user');
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem('userType', 'user');
    } catch (error) {
      console.error('Failed to save userType to storage', error);
    }
    router.replace('/(tabs)');
  };

  const loginAsVendor = async () => {
    setUserType('vendor');
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem('userType', 'vendor');
    } catch (error) {
      console.error('Failed to save userType to storage', error);
    }
    router.replace('/(Vendortab)');
  };

  const logout = async () => {
    setUserType(null);
    setIsLoggedIn(false);
    try {
      await AsyncStorage.removeItem('userType');
    } catch (error) {
      console.error('Failed to remove userType from storage', error);
    }
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ userType, isLoggedIn, loginAsUser, loginAsVendor, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
