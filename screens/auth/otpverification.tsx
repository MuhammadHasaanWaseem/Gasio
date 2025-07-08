import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkConfirmation = async () => {
      setChecking(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          Alert.alert('Error', error.message);
          setChecking(false);
          return;
        }
        if (user && user.email_confirmed_at) {
          setChecking(false);
          router.push('/(auth)/createUserProfile');
        } else {
          // Not confirmed yet, check again after delay
          setTimeout(checkConfirmation, 3000);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to check confirmation.');
        setChecking(false);
      }
    };
    checkConfirmation();
  }, []);

  if (loading || checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ed3237" />
        <Text style={styles.text}>Waiting for email confirmation...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Please confirm your email to proceed.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    marginTop: 20,
    color:'#000',
    fontSize: 18,
    textAlign: 'center',
  },
});
