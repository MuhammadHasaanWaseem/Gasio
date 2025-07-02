import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const storage = {
  getItem: async (key: string) => {
    return isWeb ? Promise.resolve(window.localStorage.getItem(key)) : AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    return isWeb ? Promise.resolve(window.localStorage.setItem(key, value)) : AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    return isWeb ? Promise.resolve(window.localStorage.removeItem(key)) : AsyncStorage.removeItem(key);
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
    const checkLoginStatus = async () => {
      try {
        const storedUserType = await storage.getItem('userType');
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (!currentUser || userError) {
          setUserType(null);
          setIsLoggedIn(false);
          router.replace('/login');
          return;
        }

        if (storedUserType === 'user') {
          setUserType('user');
          setIsLoggedIn(true);
          router.replace('/(tabs)');
        } else if (storedUserType === 'vendor') {
          const { data: vendorProfile, error: profileError } = await supabase
            .from('vendor_owners')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          setUserType('vendor');
          setIsLoggedIn(true);

          if (profileError || !vendorProfile) {
            router.replace('/createVendorProfile');
          } else {
            router.replace('/(Vendortab)');
          }
        } else {
          setUserType(null);
          setIsLoggedIn(false);
          router.replace('/login');
        }
      } catch (error) {
        console.error('Login status check failed:', error);
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
      console.error('Failed to store userType for user:', error);
    }
    router.replace('/(tabs)');
  };

  const loginAsVendor = async () => {
    setUserType('vendor');
    setIsLoggedIn(true);
    try {
      await storage.setItem('userType', 'vendor');
    } catch (error) {
      console.error('Failed to store userType for vendor:', error);
    }
    // Navigation handled outside based on vendor profile existence
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserType(null);
    setIsLoggedIn(false);
    try {
      await storage.removeItem('userType');
    } catch (error) {
      console.error('Failed to clear userType:', error);
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
