import { useUser } from '@/context/usercontext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';

MapboxGL.setAccessToken(
  Constants.expoConfig?.extra?.EXPO_PUBLIC_MAP_BOX_API_KEY ||
    process.env.EXPO_PUBLIC_MAP_BOX_API_KEY ||
    ''
);

const SearchNearbyScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const searchVendors = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, address, latitude, longitude, rating')
        .ilike('business_name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleLocationSelect = (vendor: any) => {
    setSelectedLocation({
      latitude: vendor.latitude,
      longitude: vendor.longitude
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search nearby vendors..."
          placeholderTextColor="#718096"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchVendors(text);
          }}
          autoFocus
        />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          style={styles.map}
          logoEnabled={false}
        >
          <MapboxGL.Camera
            centerCoordinate={
              selectedLocation 
                ? [selectedLocation.longitude, selectedLocation.latitude]
                : [user?.longitude || -122.4324, user?.latitude || 37.78825]
            }
            zoomLevel={12}
          />
          
          {user?.latitude && user.longitude && (
            <MapboxGL.PointAnnotation
              id="userLocation"
              coordinate={[user.longitude, user.latitude]}
              title="Your Location"
            >
              <View style={styles.userMarker}>
                <Ionicons name="location" size={20} color="#6C63FF" />
              </View>
            </MapboxGL.PointAnnotation>
          )}
          
          {results.map(vendor => (
            vendor.latitude && vendor.longitude && (
              <MapboxGL.PointAnnotation
                key={vendor.id}
                id={`vendor-${vendor.id}`}
                coordinate={[vendor.longitude, vendor.latitude]}
                title={vendor.business_name}
                onSelected={() => handleLocationSelect(vendor)}
              >
                <View style={styles.vendorMarker}>
                  <Ionicons name="business" size={16} color="#FF6B6B" />
                </View>
              </MapboxGL.PointAnnotation>
            )
          ))}
        </MapboxGL.MapView>
      </View>

      {/* Search Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.resultItem}
            onPress={() => {
    ToastAndroid.show(
      'You need to search from the search screen for this service because this business is not registered on Google Maps.',
      ToastAndroid.LONG // or ToastAndroid.SHORT
    );
  }}
          >
            <Text style={styles.resultName}>{item.business_name}</Text>
            <Text style={styles.resultAddress} numberOfLines={1}>
              <Ionicons name="location-outline" size={14} color="#718096" />
              {` ${item.address}`}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'New'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#CBD5E0" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No vendors found' : 'Search for nearby vendors'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginLeft: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  mapContainer: {
    height: 300,
  },
  map: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
    textAlign: 'center',
  },
  userMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  vendorMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SearchNearbyScreen;