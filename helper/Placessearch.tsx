import MapModal from '@/components/MapModal';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import * as Location from 'expo-location';
import debounce from 'lodash/debounce';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Keyboard,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';
export default () => {
  const [search, setSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useNearbyPlaces(search, selectedLocation); // <- pass location if supported

  const debouncedSearch = useMemo(
    () =>
      debounce((text: string) => {
        setSearch(text);
        setIsTyping(false);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const handleSearch = (text: string) => {
    setIsTyping(true);
    debouncedSearch(text);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number }) => {
    setSelectedLocation(location);
    refetch();
  };

  const handleUseCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to get your current location.');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setSelectedLocation(coords);
    refetch();
  };

  const showLoading = (isLoading || isRefetching) && search.trim();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Button title="Choose Location on Map" onPress={() => setIsMapVisible(true)} />
        <Button title="Use Current Location" onPress={handleUseCurrentLocation} />
        {selectedLocation && (
          <Text style={styles.selectedLocation}>
            📍 Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
          </Text>
        )}

        <TextInput
          placeholder="Search nearby places..."
          placeholderTextColor="#999"
          onChangeText={handleSearch}
          style={styles.searchInput}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />

        {showLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#000" />
          </View>
        )}

        {isError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error?.message || 'Error fetching nearby places'}
            </Text>
          </View>
        )}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#000"
            />
          }
          ListEmptyComponent={
            !showLoading ? (
              <Text style={styles.noResults}>
                {search.trim() ? 'No places found' : 'Search for nearby places'}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.place_name}</Text>
              <Text style={styles.desc}>
                Latitude: {item.center[1].toFixed(4)}, Longitude: {item.center[0].toFixed(4)}
              </Text>
            </View>
          )}
          contentContainerStyle={data?.length === 0 && styles.listContainer}
        />

        <MapModal
          visible={isMapVisible}
          onClose={() => setIsMapVisible(false)}
          onLocationSelect={handleLocationSelect}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 15,
  },
  loadingIndicator: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  selectedLocation: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 14,
    color: '#555',
  },
});
