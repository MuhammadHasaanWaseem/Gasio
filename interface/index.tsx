
export interface VendorOwner {
  id: string;
  full_name: string;
  profile_picture_url: string;
}

export interface Vendor {
  id: string;
  full_name: string;
  profile_picture_url: string;
  owner?: VendorOwner; //  vendor has an owner
}

export interface Service {
  id: string;
  vendor_id: string;
  service_name: string;
  description: string;
  price: number;
  order_time: any;
  created_at: string;
  updated_at: string;
  vendor?: Vendor; //  service has a vendor
}

export interface Order {
  id: string;
  service_id: string;
  user_id: string;
  vendor_id: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Accepted' | 'Cancelled';
  created_at: string;
  updated_at: string;
  order_time: any;
  service?: Service; //  order has a service
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  vendor_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}
