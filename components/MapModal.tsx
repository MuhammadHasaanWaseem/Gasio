import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';
import Constants from 'expo-constants';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Mapbox access token is now initialized globally in app/_layout.tsx

interface LocationResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
}

const geocodeLocation = async (query: string): Promise<LocationResult[]> => {
  if (!query.trim()) return [];

  const apiKey =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_MAP_BOX_API_KEY ||
    process.env.EXPO_PUBLIC_MAP_BOX_API_KEY;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json`;

  try {
    const response = await axios.get(url, {
      params: {
        access_token: apiKey,
        limit: 10,
      },
    });

    if (!response.data.features) return [];

    return response.data.features.map((feature: any) => ({
      id: feature.id,
      name: feature.place_name,
      latitude: feature.center[1],
      longitude: feature.center[0],
    }));
  } catch (err) {
    console.error('Mapbox Geocoding Error:', err);
    return [];
  }
};

const MapModal: React.FC<MapModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  const performSearch = useCallback(
    debounce(async (query: string) => {
      setIsSearching(true);
      const results = await geocodeLocation(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 500),
    []
  );

  useEffect(() => {
    if (searchQuery) performSearch(searchQuery);
    else setSearchResults([]);
  }, [searchQuery]);

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleMapPress = (e: any) => {
    const [longitude, latitude] = e.geometry.coordinates;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (selectedLocation) onLocationSelect(selectedLocation);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search location..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {isSearching && <ActivityIndicator size="small" />}
        </View>

        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleLocationSelect(item)}
              >
                <Text style={{color:'black'}}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.mapContainer}>
          <MapboxGL.MapView
            style={styles.map}
            onPress={handleMapPress}
            logoEnabled={false}
          >
            <MapboxGL.Camera
              centerCoordinate={
                selectedLocation
                  ? [selectedLocation.longitude, selectedLocation.latitude]
                  : [67.0011, 24.8607] // Default Karachi
              }
              zoomLevel={12}
            />

            {selectedLocation && (
              //@ts-ignore
              <MapboxGL.PointAnnotation
                id="selectedLocation"
                coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
              />
            )}
          </MapboxGL.MapView>
        </View>

        <View style={styles.footer}>
          {selectedLocation && (
            <Text style={styles.coordinateText}>
              📍 Lat: {selectedLocation.latitude.toFixed(4)}, Lng: {selectedLocation.longitude.toFixed(4)}
            </Text>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, !selectedLocation && styles.disabled]}
              disabled={!selectedLocation}
              onPress={handleConfirm}
            >
              <Text style={{ color: '#fff' }}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    color:'black',
  },
  searchInput: {
    height: 45,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    color:'black',
    backgroundColor: '#f5f5f5',
  },
  resultsList: { maxHeight: 200 },
  resultItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee',color:'black' },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  footer: { padding: 12 },
  coordinateText: { textAlign: 'center', marginBottom: 10 ,color:'black'},
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    color:'black',
    alignItems: 'center',
    
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    color:'black',
    flex: 1,
    marginLeft: 6,
    alignItems: 'center',
  },
  disabled: { backgroundColor: '#a5d6a7' },
});

export default MapModal;
