import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import MapboxGL from '@rnmapbox/maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
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
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';

export default () => {
  const [rating,setrating]=useState<number[]>([]);
 const fetchratings = async () => {
    if (!vendor?.id) return;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('vendor_id', vendor.id);

    if (error) {
      console.error('Error fetching ratings:', error.message);
      return;
    }

     const numericRatings = data?.map((item) => item.rating) ?? [];
  setrating(numericRatings);
  };
 const averageRating =
    rating.length > 0
      ? (rating.reduce((acc, val) => acc + val, 0) / rating.length).toFixed(1)
      : 'No Ratings';  
      console.log(averageRating)
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
fetchratings();
    fetchUser();
  }, [vendor]);
console.log('Vendor:', vendor);

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
      <LinearGradient 
        colors={['#6d28d9', '#4c1d95']} 
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading Vendor Details</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderStars = (averageRating: number, size = 16) => {
  

    return <Star color={'yellow'} fill={'yellow'}/>
  };

  return (
    <LinearGradient 
      colors={['#f0f9ff', '#e0f2fe']} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header with gradient */}
        <LinearGradient
colors={['#ed3237', '#ff5f6d']}          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Vendor Details</Text>
          <View style={{ width: 24 }} />
        </LinearGradient>

        <Animated.View 
          entering={FadeInUp.duration(600).delay(200)} 
          style={styles.vendorHeader}
        >
          {vendor.business_logo_url ? (
            <Image 
              source={{ uri: vendor.business_logo_url }} 
              style={styles.vendorLogo} 
            />
          ) : (
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={[styles.vendorLogo, styles.logoPlaceholder]}
            >
              <Ionicons name="business" size={36} color="white" />
            </LinearGradient>
          )}

          <View style={styles.vendorInfo}>
            <Text style={styles.businessName}>{vendor.business_name}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(vendor.rating || 0, 18)}
              <Text style={styles.ratingText}>{averageRating ||'New'}</Text>
              <Text style={styles.ordersText}>• {vendor.total_orders} orders</Text>
            </View>
            <View style={styles.availabilityContainer}>
              <View
                style={[
                  styles.availabilityDot,
                  { backgroundColor: vendor.is_available ? '#10b981' : '#ef4444' },
                ]}
              />
              <Text style={styles.availabilityText}>
                {vendor.is_available ? 'Available now' : 'Currently unavailable'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(600).delay(300)} 
          style={styles.detailsCard}
        >
          <Text style={styles.sectionTitle}>About Business</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#6d28d9" />
            <Text style={styles.detailText}>{vendor.address}</Text>
          </View>

          {vendor.website && (
            <View style={styles.detailRow}>
              <Ionicons name="globe-outline" size={20} color="#6d28d9" />
              <Text style={[styles.detailText, styles.linkText]}>{vendor.website}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color="#6d28d9" />
            <Text style={styles.detailText}>
              Total earnings: ${vendor.total_earnings?.toFixed(2)}
            </Text>
          </View>
        </Animated.View>

        {vendor.latitude && vendor.longitude && (
          <Animated.View 
            entering={FadeInDown.duration(600).delay(400)} 
            style={styles.mapContainer}
          >
            <Text style={styles.sectionTitle}>Location</Text>
            <MapboxGL.MapView
              style={styles.map}
              logoEnabled={false}
            >
              <MapboxGL.Camera
                centerCoordinate={[vendor.longitude, vendor.latitude]}
                zoomLevel={14}
              />
              <MapboxGL.PointAnnotation
                id="vendorLocation"
                coordinate={[vendor.longitude, vendor.latitude]}
                title={vendor.business_name}
              >
                <View style={styles.marker}>
                  <Ionicons name="location" size={24} color="#7c3aed" />
                </View>
              </MapboxGL.PointAnnotation>
            </MapboxGL.MapView>
          </Animated.View>
        )}

        <Animated.View 
          entering={FadeInDown.duration(600).delay(500)} 
          style={styles.servicesContainer}
        >
          <Text style={styles.sectionTitle}>Services Offered</Text>
          {services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Ionicons name="construct-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No services listed</Text>
            </View>
          ) : (
            <FlatList
              data={services}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesList}
              renderItem={({ item, index }) => (
                <Animated.View 
                  entering={FadeInRight.duration(500).delay(100 * index)}
                >
                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() => router.push({
                      pathname:'/Eservice',
                      params:{id:item.id}
                    })}
                  >
                    <LinearGradient
                      colors={['#ede9fe', '#e0e7ff']}
                      style={styles.serviceGradient}
                    >
                      <Text style={styles.serviceName} numberOfLines={1}>
                        {item.service_name}
                      </Text>
                      <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
                      <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={16} color="#6d28d9" />
                        <Text style={styles.serviceTime}>{item.estimated_time}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          )}
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(600).delay(700)} 
          style={styles.buttonContainer}
        >
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 40 },
  loadingContainer: { 
    flex: 1, 
    backgroundColor:'white',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  vendorHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginTop: -40,
  },
  vendorLogo: { 
    width: 90, 
    height: 90, 
    borderRadius: 20, 
    marginRight: 20,
    borderWidth: 3,
    borderColor: 'white',
  },
  logoPlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center',
    borderColor: '#f5f3ff',
  },
  vendorInfo: { flex: 1 },
  businessName: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1e293b',
    marginBottom: 8 
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  ratingText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#4b5563', 
    marginLeft: 8 
  },
  ordersText: { 
    fontSize: 16, 
    color: '#64748b', 
    marginLeft: 8 
  },
  availabilityContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  availabilityDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: 8 
  },
  availabilityText: { 
    fontSize: 15, 
    color: '#334155',
    fontWeight: '500'
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 15 
  },
  detailText: { 
    fontSize: 16, 
    color: '#475569', 
    marginLeft: 12, 
    flex: 1,
    lineHeight: 24,
  },
  linkText: { 
    color: '#6366f1',
    textDecorationLine: 'underline'
  },
  mapContainer: { 
    marginHorizontal: 20,
    marginBottom: 20,
  },
  map: { 
    height: 220, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  marker: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  servicesContainer: { 
    marginHorizontal: 20,
    marginBottom: 20,
  },
  servicesList: { 
    paddingVertical: 10,
    paddingRight: 20,
  },
  serviceCard: {
    width: 220,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  serviceGradient: {
    padding: 20,
    borderRadius: 20,
  },
  serviceName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 12,
  },
  servicePrice: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#7c3aed', 
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTime: { 
    fontSize: 16, 
    color: '#64748b',
    marginLeft: 6,
  },
  emptyServices: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: { 
    fontSize: 16, 
    color: '#94a3b8', 
    marginTop: 15,
    fontWeight: '500'
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  contactButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  contactButtonText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#fff', 
    marginLeft: 10 
  },
});