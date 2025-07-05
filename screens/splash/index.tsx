import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';

export default () => {
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (hasCompletedOnboarding === 'true') {
          router.replace('/(auth)/login');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        // In case of error, navigate to onboarding as fallback
        router.replace('/onboarding');
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Image source={require('../../assets/splahicon/splash.gif')} style={{ width: 200, height: 200 }} />
    </View>
  );
};
