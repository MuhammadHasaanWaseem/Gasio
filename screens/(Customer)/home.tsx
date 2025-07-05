// app/(tabs)/index.tsx
import { useUser } from '@/context/usercontext';
import { supabase } from '@/lib/supabase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const HomeScreen = () => {
  const { user } = useUser();
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [region, setRegion] = useState({
    latitude: user?.latitude || 37.78825,
    longitude: user?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Fixed: Removed location state and dependency
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch nearby vendors based on user location
      let vendorsQuery = supabase
        .from('vendors')
        .select('id, business_name, business_logo_url, rating, address, latitude, longitude')
        .order('rating', { ascending: false })
        .limit(5);

      if (user?.latitude && user.longitude) {
        // This is a simplified distance calculation - in production you'd use PostGIS
        vendorsQuery = vendorsQuery
          .gte('latitude', user.latitude - 0.1)
          .lte('latitude', user.latitude + 0.1)
          .gte('longitude', user.longitude - 0.1)
          .lte('longitude', user.longitude + 0.1);
      }

      const { data: vendorsData, error: vendorsError } = await vendorsQuery;

      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);

      // Fetch popular services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          service_name,
          description,
          price,
          estimated_time,
          vendor_id,
          vendors!inner(
            business_name,
            business_logo_url,
            rating
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Update map region if we have user location
      if (user?.latitude && user.longitude) {
        setRegion({
          latitude: user.latitude,
          longitude: user.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]); // Only depend on user object

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Now safe to use fetchData as dependency

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
const [categories, setCategories] = useState<string[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('tags');

    if (error) {
      console.error('Error fetching tags:', error);
      return;
    }

    // Flatten all tags from all rows
    const allTags = data
      .map(service => service.tags || [])
      .flat();

    // Remove duplicates and empty strings
    const uniqueTags = [...new Set(allTags)].filter(Boolean);

    setCategories(uniqueTags);
  };

  fetchCategories();
}, []);

  const renderServiceItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(100 * index).duration(500)}
      style={styles.serviceCard}
    >
      <TouchableOpacity
        onPress={() => router.push({
          pathname:'/Eservice',
          params:{
            id:item.id
          }
        })}
      >
        <View style={styles.serviceHeader}>
          {item.vendors.business_logo_url ? (
            <Image
              source={{ uri: item.vendors.business_logo_url }}
              style={styles.businessLogo}
            />
          ) : (
            <View style={[styles.businessLogo, styles.logoPlaceholder]}>
              <Ionicons name="business" size={24} color="#6C63FF" />
            </View>
          )}
          <Text style={styles.businessName}>{item.vendors.business_name}</Text>
        </View>

        <Text style={styles.serviceName}>{item.service_name}</Text>
        <Text style={styles.serviceDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.serviceFooter}>
          <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.serviceTime}>
            <Ionicons name="time-outline" size={14} color="#718096" />
            {` ${item.estimated_time}`}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderVendorItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(150 * index).duration(500)}
      style={styles.vendorCard}
    >
      <TouchableOpacity
        onPress={() => router.push({
          pathname:'/vendor',
          params:{
            id:item.id
          }
        })}
      >
        <View style={styles.vendorHeader}>
          {item.business_logo_url ? (
            <Image
              source={{ uri: item.business_logo_url }}
              style={styles.vendorLogo}
            />
          ) : (
            <View style={[styles.vendorLogo, styles.logoPlaceholder]}>
              <Ionicons name="business" size={32} color="#6C63FF" />
            </View>
          )}
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{item.business_name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'New'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.vendorLocation}>
          <Ionicons name="location-outline" size={16} color="#718096" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.address || 'Location not specified'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e4e7f1']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header with user greeting */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'there'}! 👋</Text>
              <Text style={styles.subtitle}>What service do you need today?</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color="#6C63FF" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchContainer}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
            <Text style={styles.searchText}>Search services or vendors...</Text>
          </TouchableOpacity>

          {/* Location Map Preview */}
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Services Near You</Text>
            <View style={styles.mapWrapper}>
              {user?.latitude && user.longitude ? (
                <MapView
                  style={styles.map}
                  region={region}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: user.latitude,
                      longitude: user.longitude
                    }}
                    title="Your Location"
                    pinColor="#6C63FF"
                  />
                  {vendors.slice(0, 5).map(vendor => (
                    vendor.latitude && vendor.longitude && (
                      <Marker
                        key={vendor.id}
                        coordinate={{
                          latitude: vendor.latitude,
                          longitude: vendor.longitude
                        }}
                        title={vendor.business_name}
                      />
                    )
                  ))}
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={48} color="#CBD5E0" />
                  <Text style={styles.mapPlaceholderText}>Enable location to see nearby services</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/searchnearby')}
            >
              <LinearGradient
                colors={['#6C63FF', '#8A85FF']}
                style={styles.actionIcon}
              >
                <Ionicons name="map" size={28} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>Find Nearby</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/Orders')}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.actionIcon}
              >
                <Ionicons name="list" size={28} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              //onPress={() => router.push('/usermessage')}
            >
              <LinearGradient
                colors={['#FF9800', '#FFB74D']}
                style={styles.actionIcon}
              >
                <MessageCircle fill={'white'} size={28} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
          </View>

          {/* Top Vendors */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Vendors Buisness</Text>
              <TouchableOpacity
                onPress={() => router.push('/topvendors')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#6C63FF" style={styles.loadingIndicator} />
            ) : vendors.length > 0 ? (
              <FlatList
                data={vendors}
                renderItem={renderVendorItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.vendorsList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="business-outline" size={48} color="#CBD5E0" />
                <Text style={styles.emptyText}>No vendors nearby</Text>
              </View>
            )}
          </View>

          {/* Popular Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Services by Vendors</Text>
              <TouchableOpacity
                onPress={() => router.push('/topservices')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#6C63FF" style={styles.loadingIndicator} />
            ) : services.length > 0 ? (
              <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.servicesGrid}
                scrollEnabled={false}
                contentContainerStyle={styles.servicesList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="construct-outline" size={48} color="#CBD5E0" />
                <Text style={styles.emptyText}>No services available</Text>
              </View>
            )}
          </View>

          {/* Service Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Categories</Text>
            <View style={styles.categoriesContainer}>
              {[
                { name: 'Maintenance', icon: 'build-circle', color: '#6C63FF' },
                { name: 'Gas Delivery', icon: 'handyman', color: '#4CAF50' },
                { name: 'Installation', icon: 'plumbing', color: '#FF9800' },
                { name: 'Refill', icon: 'local-gas-station', color: '#9C27B0' },
                { name: 'Consultation', icon: 'support-agent', color: '#F44336' },
                { name: 'All', icon: 'category', color: '#607D8B' },
              ].map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryCard}
                  onPress={() => router.push(
                    {
                      pathname:'/category',
                      params:{
                        id:category.name
                      }
                    }
                  )}
                >
                  <LinearGradient
                    colors={[`${category.color}33`, `${category.color}11`]}
                    style={[styles.categoryIcon, { borderColor: category.color }]}
                  >
                    <MaterialIcons
                      name={category.icon as any}
                      size={28}
                      color={category.color}
                    />
                  </LinearGradient>
                  <Text style={styles.categoryText}>{category.name}</Text>

                </TouchableOpacity>
              ))}

            </View>
          </View>
          <Text>

          </Text>
          <Text>

          </Text>
          <Text>

          </Text>
          <Text>

          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles remain the same as in your previous code
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  avatarPlaceholder: {
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    fontSize: 16,
    color: '#718096',
    flex: 1,
  },
  mapContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  actionCard: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAll: {
    color: '#6C63FF',
    fontWeight: '600',
    fontSize: 16,
  },
  vendorsList: {
    paddingBottom: 10,
  },
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 280,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 4,
  },
  vendorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
    flex: 1,
  },
  servicesList: {
    paddingBottom: 10,
  },
  servicesGrid: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 8,
  },
  logoPlaceholder: {
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 18,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
  serviceTime: {
    fontSize: 13,
    color: '#718096',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
  },
  loadingIndicator: {
    paddingVertical: 20,
  },
});

export default HomeScreen;