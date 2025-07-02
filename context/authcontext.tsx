import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const storage = {
  getItem: async (key: string) => {
    if (isWeb) {
      return Promise.resolve(window.localStorage.getItem(key));
    } else {
      return AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    if (isWeb) {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (isWeb) {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    } else {
      return AsyncStorage.removeItem(key);
    }
  },
};

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
    // Check login status from storage here
    const checkLoginStatus = async () => {
      try {
        const storedUserType = await storage.getItem('userType');
        if (storedUserType === 'user') {
          setUserType('user');
          setIsLoggedIn(true);
          router.replace('/(tabs)');
        } else if (storedUserType === 'vendor') {
          // Check if vendor profile exists
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          if (userError || !currentUser) {
            setUserType(null);
            setIsLoggedIn(false);
            router.replace('/login');
            return;
          }
          const { data: vendorProfile, error: profileError } = await supabase
            .from('vendor_owners')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          if (profileError || !vendorProfile) {
            setUserType('vendor');
            setIsLoggedIn(true);
            router.replace('/createVendorProfile');
          } else {
            setUserType('vendor');
            setIsLoggedIn(true);
            router.replace('/(Vendortab)');
          }
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
      await storage.setItem('userType', 'user');
    } catch (error) {
      console.error('Failed to save userType to storage', error);
    }
    router.replace('/(tabs)');
  };

  const loginAsVendor = async () => {
    setUserType('vendor');
    setIsLoggedIn(true);
    try {
      await storage.setItem('userType', 'vendor');
    } catch (error) {
      console.error('Failed to save userType to storage', error);
    }
    router.replace('/(Vendortab)');
  };

  const logout = async () => {
    setUserType(null);
    setIsLoggedIn(false);
    try {
      await storage.removeItem('userType');
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
