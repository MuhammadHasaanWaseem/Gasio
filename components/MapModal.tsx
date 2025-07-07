
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
import MapView, { Marker, Region } from 'react-native-maps';

import axios from 'axios';
import Constants from 'expo-constants';

interface LocationResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const geocodeLocation = async (query: string): Promise<LocationResult[]> => {
  if (!query.trim()) {
    return [];
  }

  const apiKey = Constants.manifest?.extra?.EXPO_PUBLIC_MAP_BOX_API_KEY || process.env.EXPO_PUBLIC_MAP_BOX_API_KEY;
  if (!apiKey) {
    console.warn('Mapbox API key is not set in environment variables.');
    return [];
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;

  try {
    const response = await axios.get(url, {
      params: {
        access_token: apiKey,
        limit: 10,
      },
    });

    if (!response.data.features) {
      console.error('Mapbox API error: No features found');
      return [];
    }

    return response.data.features.map((feature: any) => ({
      id: feature.id,
      name: feature.place_name,
      latitude: feature.center[1],
      longitude: feature.center[0],
    }));
  } catch (error) {
    console.error('Error fetching geocoding data from Mapbox:', error);
    return [];
  }
};

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

const MapModal: React.FC<MapModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(initialLocation || null);

  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 37.78825,
    longitude: initialLocation?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const results = await geocodeLocation(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleMapPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    setRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
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
          {isSearching && (
            <ActivityIndicator style={styles.searchLoader} size="small" color="#000" />
          )}
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
                <Text style={styles.resultText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          onRegionChangeComplete={setRegion}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} />}
        </MapView>

        <View style={styles.footer}>
          {selectedLocation && (
            <Text style={styles.coordinateText}>
              📍 Latitude: {selectedLocation.latitude.toFixed(4)},
              Longitude: {selectedLocation.longitude.toFixed(4)}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, !selectedLocation && styles.disabledButton]}
              onPress={handleConfirm}
              disabled={!selectedLocation}
            >
              <Text style={styles.buttonText}>Select Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
  },
  searchLoader: {
    position: 'absolute',
    right: 30,
  },
  resultsList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  coordinateText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapModal;
