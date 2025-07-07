import { Alert } from 'react-native';

export const handleError = (error: any, context: string = '') => {
  console.error(`Error in ${context}:`, error);
  
  // Don't show alerts for network errors in production
  if (__DEV__) {
    Alert.alert(
      'Error',
      `An error occurred: ${error?.message || error?.toString() || 'Unknown error'}`,
      [{ text: 'OK' }]
    );
  }
};

export const handleAsyncError = (error: any, context: string = '') => {
  console.error(`Async error in ${context}:`, error);
  
  // Handle specific error types
  if (error?.code === 'NETWORK_ERROR') {
    Alert.alert(
      'Network Error',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  } else if (error?.code === 'AUTH_ERROR') {
    Alert.alert(
      'Authentication Error',
      'Please log in again.',
      [{ text: 'OK' }]
    );
  } else if (__DEV__) {
    Alert.alert(
      'Error',
      `An error occurred: ${error?.message || error?.toString() || 'Unknown error'}`,
      [{ text: 'OK' }]
    );
  }
};

// Utility to safely validate UUIDs before database queries
export const isValidUUID = (uuid: any): boolean => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Safe database query wrapper
export const safeQuery = async (queryFn: () => Promise<any>, fallback: any = null) => {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Database query failed:', error);
    return { data: fallback, error };
  }
}; 