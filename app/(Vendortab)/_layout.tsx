import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import {
  Box,
  ClipboardList,
  LayoutDashboard,
  Star,
  User,
} from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarBackground: () => (
          <View style={styles.tabBackgroundWrapper}>
            <LinearGradient
              colors={['#ed3237', '#ff5f6d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tabBackground}
            />
            <View style={styles.shadowGlow} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <LayoutDashboard size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="MyServicesScreen"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Box size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="VendorOrdersScreen"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <ClipboardList size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="VendorReviewScreen"
        options={{
          title: 'Ratings',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Star size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="VendorProfile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <User size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 15,
    right: 15,
    height: 75,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    overflow: 'visible',
  },
  tabBackgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  tabBackground: {
    width: width - 30,
    height: 75,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  shadowGlow: {
    position: 'absolute',
    bottom: -15,
    width: width - 20,
    height: 60,
    borderRadius: 40,
    backgroundColor: '#ed3237',
    opacity: 0.25,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    zIndex: -1,
  },
  iconContainer: {
    position: 'absolute',
    top: -16,
    width: 58,
    height: 58,
    borderRadius: 29,
    // backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    transform: [{ scale: 0.95 }],
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: 5,
    textAlign: 'center',
    color: '#fff',
  },
});
