-- 1. user_profiles (for Customers)

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  avatar_url TEXT, -- from Supabase Storage 'avatars' bucket
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 --2. vendor_owners (Owner Details)

CREATE TABLE public.vendor_owners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  email TEXT,
  cnic TEXT NOT NULL UNIQUE,
  profile_picture_url TEXT, -- from Supabase Storage 'owner_profiles'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 3. vendors (Vendor Business Info)
sql
Copy
Edit
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES vendor_owners(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_license TEXT,
  business_logo_url TEXT, -- optional: storage bucket 'vendor_logos'
  address TEXT,
  website TEXT;
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_available BOOLEAN DEFAULT TRUE,
  rating FLOAT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 4. services (Vendor Services)

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  estimated_time TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 5. orders
CREATE TYPE order_status AS ENUM ('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  vendor_id UUID REFERENCES vendors(id),
  service_id UUID REFERENCES services(id),
  status order_status DEFAULT 'Pending',
  delivery_address TEXT,
  scheduled_time TIMESTAMP,
  order_status text
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_price DECIMAL(10,2),
  notes TEXT,
  is_paid BOOLEAN DEFAULT FALSE
);
-- 6. payments

CREATE TYPE payment_method_enum AS ENUM ('Stripe', 'Cash on Delivery');
CREATE TYPE payment_status_enum AS ENUM ('Pending', 'Paid', 'Failed');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  vendor_id UUID REFERENCES vendors(id),
  method payment_method_enum NOT NULL,
  status payment_status_enum DEFAULT 'Pending',
  amount DECIMAL(10,2),
  transaction_id TEXT, -- For Stripe
  paid_at TIMESTAMP
);
--7. reviews

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  vendor_id UUID REFERENCES vendors(id),
  order_id UUID REFERENCES orders(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--8. order_stats (For Analytics)

CREATE TABLE public.order_stats (
  vendor_id UUID PRIMARY KEY REFERENCES vendors(id),
  total_orders INT DEFAULT 0,
  successful_orders INT DEFAULT 0,
  failed_orders INT DEFAULT 0,
  cancelled_orders INT DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0.00
);
Supabase Storage Buckets (create from Supabase dashboard)
Bucket Name	Purpose
avatars	User profile pictures
owner_profiles	Vendor owner CNIC images
vendor_logos	Vendor business logo/images

--
<user_id>/avatar.jpg
Add Upload Policy
Name: Users can upload their own avatar

Action: Insert

Target: Authenticated

Expression:

sql
Copy
Edit
auth.uid()::text = left(name, strpos(name, '/') - 1)
✏️ Add View Policy
Name: Users can view their own avatar

Action: Select

Target: Authenticated

Expression:

sql
Copy
Edit
auth.uid()::text = left(name, strpos(name, '/') - 1)
✏️ Add Delete Policy (optional)
Name: Users can delete their own avatar

Action: Delete

Target: Authenticated

Expression:

sql
Copy
Edit
auth.uid()::text = left(name, strpos(name, '/') - 1)
✅ Folder Naming Rule for Upload
Always upload avatars like this:

bash
Copy
Edit
<user_id>/avatar.jpg
Example:

bash
Copy
Edit
5f3d2cbd-32a4-46e1-bbb1-3c57fae6f2d9/avatar.jpg


CREATE POLICY "Allow authenticated users to upload update 1oj01fe_0" ON storage.objects FOR UPDATE TO anon, authenticated USING (auth.role() = 'authenticated');
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Per Delivery',
  ADD COLUMN IF NOT EXISTS discount NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS max_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS tags TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS addons JSONB,
  ADD COLUMN IF NOT EXISTS service_radius TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT[],
  ADD COLUMN IF NOT EXISTS availability_ TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
--  messages table

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);
