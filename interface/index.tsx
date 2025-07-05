import { ReactNode } from 'react';

export interface VendorProfileProps {
  vendor: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    profile_picture_url: string;
    business_logo_url: string;
    created_at: string;
    updated_at: string;
  };
}

export interface Service {
  [x: string]: ReactNode;
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
    order_time:any;

}

export interface Order {
  id: string;
  service_id: string;
  user_id: string;
  vendor_id: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Accepted' | 'Cancelled';
  created_at: string;
  updated_at: string;
  order_time:any;
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  vendor_id: string;
  rating: number; // stars
  comment: string;
  created_at: string;
  updated_at: string;
}
