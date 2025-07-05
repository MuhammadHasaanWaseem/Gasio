import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [vendor, setVendor] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const fetchVendorData = async () => {
    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select(`
          id,
          business_name,
          business_logo_url,
          address,
          website,
          latitude,
          longitude,
          rating,
          total_orders,
          total_earnings,
          is_available
        `)
        .eq('id', id)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          service_name,
          description,
          price,
          estimated_time
        `)
        .eq('vendor_id', id);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  if (loading || !vendor) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e4e7f1']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e7f1']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.title}>Vendors</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.vendorHeader}>
          {vendor.business_logo_url ? (
            <Image source={{ uri: vendor.business_logo_url }} style={styles.vendorLogo} />
          ) : (
            <View style={[styles.vendorLogo, styles.logoPlaceholder]}>
              <Ionicons name="business" size={32} color="#6C63FF" />
            </View>
          )}

          <View style={styles.vendorInfo}>
            <Text style={styles.businessName}>{vendor.business_name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{vendor.rating?.toFixed(1) || 'New'}</Text>
              <Text style={styles.ordersText}>• {vendor.total_orders} orders</Text>
            </View>
            <View style={styles.availabilityContainer}>
              <View
                style={[
                  styles.availabilityDot,
                  { backgroundColor: vendor.is_available ? '#48BB78' : '#E53E3E' },
                ]}
              />
              <Text style={styles.availabilityText}>
                {vendor.is_available ? 'Available now' : 'Currently unavailable'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#718096" />
            <Text style={styles.detailText}>{vendor.address}</Text>
          </View>

          {vendor.website && (
            <View style={styles.detailRow}>
              <Ionicons name="globe-outline" size={20} color="#718096" />
              <Text style={[styles.detailText, styles.linkText]}>{vendor.website}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color="#718096" />
            <Text style={styles.detailText}>
              Total earnings: ${vendor.total_earnings?.toFixed(2)}
            </Text>
          </View>
        </View>

        {vendor.latitude && vendor.longitude && (
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: vendor.latitude,
                longitude: vendor.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: vendor.latitude,
                  longitude: vendor.longitude,
                }}
                title={vendor.business_name}
              />
            </MapView>
          </View>
        )}

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          {services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Ionicons name="construct-outline" size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>No services listed</Text>
            </View>
          ) : (
            <FlatList
              data={services}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => router.push(`/service/${item.id}` as any)}
                >
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {item.service_name}
                  </Text>
                  <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.serviceTime}>
                    <Ionicons name="time-outline" size={14} color="#718096" /> {item.estimated_time}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.contactButton, !user && { opacity: 0.5 }]}
          disabled={!user}
          onPress={async () => {
            if (!user) {
              console.warn('User not logged in');
              return;
            }
            try {
              const { data: existingOrder, error: fetchError } = await supabase
                .from('orders')
                .select('id')
                .eq('user_id', user.id)
                .eq('vendor_id', vendor.id)
                .limit(1)
                .single();

              if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching existing order:', fetchError);
                return;
              }

              let orderId = existingOrder?.id;

              if (!orderId) {
                const { data: newOrder, error: insertError } = await supabase
                  .from('orders')
                  .insert({
                    user_id: user.id,
                    vendor_id: vendor.id,
                    status: 'Pending',
                    order_time: new Date().toISOString(),
                  })
                  .select('id')
                  .single();

                if (insertError) {
                  console.error('Error creating new order:', insertError);
                  return;
                }

                orderId = newOrder.id;
              }

              //router.push({
                //pathname: '/chat',
                //params: { id: orderId },
              //});
            } catch (error) {
              console.error('Error handling contact vendor:', error);
            }
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Vendor</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#2D3748' },
  vendorHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  vendorLogo: { width: 80, height: 80, borderRadius: 16, marginRight: 16 },
  logoPlaceholder: { backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center' },
  vendorInfo: { flex: 1 },
  businessName: { fontSize: 24, fontWeight: '700', color: '#2D3748', marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { fontSize: 18, fontWeight: '600', color: '#4A5568', marginLeft: 6 },
  ordersText: { fontSize: 16, color: '#718096', marginLeft: 10 },
  availabilityContainer: { flexDirection: 'row', alignItems: 'center' },
  availabilityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  availabilityText: { fontSize: 16, color: '#4A5568' },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2D3748', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailText: { fontSize: 16, color: '#4A5568', marginLeft: 12, flex: 1 },
  linkText: { color: '#4299E1' },
  mapContainer: { margin: 16 },
  map: { height: 200, borderRadius: 16 },
  servicesContainer: { margin: 16, marginTop: 8 },
  servicesList: { paddingVertical: 8 },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 200,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  servicePrice: { fontSize: 18, fontWeight: '700', color: '#6C63FF', marginBottom: 4 },
  serviceTime: { fontSize: 14, color: '#718096' },
  emptyServices: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
  },
  emptyText: { fontSize: 16, color: '#A0AEC0', marginTop: 10 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
  },
  contactButtonText: { fontSize: 18, fontWeight: '600', color: '#fff', marginLeft: 10 },
});
