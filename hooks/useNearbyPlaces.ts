import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Constants from 'expo-constants';

interface Place {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

const fetchNearbyPlaces = async (
  searchText: string
): Promise<Place[]> => {
  if (!searchText.trim()) {
    return [];
  }

  const apiKey = Constants.manifest?.extra?.EXPO_PUBLIC_MAP_BOX_API_KEY || process.env.EXPO_PUBLIC_MAP_BOX_API_KEY;
  if (!apiKey) {
    console.warn('Mapbox API key is not set in environment variables.');
    return [];
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json`;

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
      place_name: feature.place_name,
      center: feature.center,
    }));
  } catch (error) {
    console.error('Error fetching nearby places from Mapbox:', error);
    throw error;
  }
};

export const useNearbyPlaces = (searchText: string, selectedLocation: { latitude: number; longitude: number; } | null) => {
  return useQuery({
    queryKey: ['nearbyPlaces', searchText],
    queryFn: () => fetchNearbyPlaces(searchText),
    enabled: !!searchText.trim(),
  });
};
