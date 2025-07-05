import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type VendorProfile = {
  [x: string]: any;
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  cnic: string;
  profile_picture_url?: string;
  created_at?: string;
  country_code?: string;
  business_logo_url?: string;
  owner_id?:string

};


type VendorBusiness = {
  id: string;
  owner_id: string;
  business_name: string;
  business_license?: string;
  business_logo_url?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_available?: boolean;
  rating?: number;
  total_orders?: number;
  total_earnings?: number;
  created_at?: string;
  website?:string;
  
};

type VendorContextType = {
  vendor: VendorProfile | null;
  vendorBusiness: VendorBusiness | null;
  loading: boolean;
  refreshVendorProfile: () => Promise<void>;
};

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [vendorBusiness, setVendorBusiness] = useState<VendorBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendorProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        setVendor(null);
        setVendorBusiness(null);
        setLoading(false);
        return;
      }

      // Check if vendor owner profile exists
      let { data, error } = await supabase
        .from('vendor_owners')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      console.log('Vendor profile fetch data:', data, 'Error:', error);

      // If profile does not exist, create it
      if (error && error.code === 'PGRST116') {
        // Only insert if cnic is available to avoid unique constraint violation
        const cnicValue = currentUser.user_metadata?.cnic || null;
        if (!cnicValue) {
          console.warn('Vendor profile missing cnic, skipping insert to avoid duplicate key error');
          setVendor(null);
          setVendorBusiness(null);
          setLoading(false);
          return;
        }
        const { error: insertError } = await supabase
          .from('vendor_owners')
          .insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || '',
            cnic: cnicValue,
            email: currentUser.email || '',
            profile_picture_url: null,
          });
        if (insertError) {
          console.error('Error creating vendor profile:', insertError);
          setVendor(null);
          setVendorBusiness(null);
          setLoading(false);
          return;
        }
        // Fetch the newly created profile
        ({ data, error } = await supabase
          .from('vendor_owners')
          .select('*')
          .eq('id', currentUser.id)
          .single());
        if (error) {
          console.error('Error fetching newly created vendor profile:', error);
          setVendor(null);
          setVendorBusiness(null);
          setLoading(false);
          return;
        }
      } else if (error) {
        console.error('Error fetching vendor profile:', error);
        setVendor(null);
        setVendorBusiness(null);
        setLoading(false);
        return;
      }

      setVendor(data);

      // Fetch vendor business info from vendors table
      const { data: vendorBusinessData, error: vendorBusinessError } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();

      if (vendorBusinessError) {
        if (vendorBusinessError.code === 'PGRST116') {
          setVendorBusiness(null);
        } else {
          console.error('Error fetching vendor business info:', vendorBusinessError);
          setVendorBusiness(null);
        }
      } else {
        setVendorBusiness(vendorBusinessData);
        console.log('Vendor:', data);
        console.log('VendorBusiness:', vendorBusinessData);
      }
    } catch (error) {
      console.error('Unexpected error fetching vendor profile:', error);
      setVendor(null);
      setVendorBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchVendorProfile();
    });

    return () => {
      if (authListener && typeof authListener.subscription?.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <VendorContext.Provider value={{ vendor, vendorBusiness, loading, refreshVendorProfile: fetchVendorProfile }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = (): VendorContextType => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};