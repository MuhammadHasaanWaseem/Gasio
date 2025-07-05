import { useUser } from '@/context/usercontext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: user?.latitude || 37.78825,
            longitude: user?.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          region={
            selectedLocation ? {
              ...selectedLocation,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            } : undefined
          }
        >
          {user?.latitude && user.longitude && (
            <Marker
              coordinate={{
                latitude: user.latitude,
                longitude: user.longitude
              }}
              title="Your Location"
              pinColor="#6C63FF"
            />
          )}
          
          {results.map(vendor => (
            vendor.latitude && vendor.longitude && (
              <Marker
                key={vendor.id}
                coordinate={{
                  latitude: vendor.latitude,
                  longitude: vendor.longitude
                }}
                title={vendor.business_name}
                onPress={() => handleLocationSelect(vendor)}
              />
            )
          ))}
        </MapView>
      </View>

      {/* Search Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.resultItem}
            onPress={() => handleLocationSelect(item)}
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
});

export default SearchNearbyScreen;