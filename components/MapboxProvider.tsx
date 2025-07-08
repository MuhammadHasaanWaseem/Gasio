import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface MapboxProviderProps {
  children: React.ReactNode;
}

const MapboxProvider: React.FC<MapboxProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMapbox = async () => {
      try {
        const mapboxToken = 
          Constants.expoConfig?.extra?.EXPO_PUBLIC_MAP_BOX_API_KEY ||
          process.env.EXPO_PUBLIC_MAP_BOX_API_KEY ||
          'pk.eyJ1IjoiaGFzYWFud2FzZWVtIiwiYSI6ImNtY29yYXl6cTA2MzEybHNhbmluN216YnAifQ.faqaZsus5jTj27JMmvBVqw';

        if (!mapboxToken) {
          throw new Error('Mapbox access token is not configured!');
        }

        MapboxGL.setAccessToken(mapboxToken);
        console.log('Mapbox initialized successfully with token:', mapboxToken.substring(0, 20) + '...');
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Mapbox:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initializeMapbox();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 10 }}>
          Mapbox Error:
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
          Initializing Mapbox...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default MapboxProvider; 