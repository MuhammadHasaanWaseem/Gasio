import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type UserProfile = {
  id: string;
  full_name: string;
  avatar_url: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  country_code?:number
};

type UserContextType = {
  user: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if user profile exists
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      console.log('User profile fetch data:', data, 'Error:', error);

      // If profile does not exist, create it
      if (error && error.code === 'PGRST116') { // 404 not found
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || '',
            avatar_url: null,
          });
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          setUser(null);
          setLoading(false);
          return;
        }
        // Fetch the newly created profile
        ({ data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single());
        if (error) {
          console.error('Error fetching newly created user profile:', error);
          setUser(null);
          setLoading(false);
          return;
        }
      } else if (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(data);

    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUserProfile: fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
