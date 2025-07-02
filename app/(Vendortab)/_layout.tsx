import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import {
  Box,
  ClipboardList,
  LayoutDashboard,
  Star,
  User,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
     screenOptions={{
             headerShown: false,
             tabBarActiveTintColor: '#fff',
             tabBarInactiveTintColor: '#ffcccc',
             tabBarButton: HapticTab,
             tabBarStyle: styles.tabBar,
             tabBarBackground: () => (
               <View style={styles.tabBackgroundWrapper}>
                 <View style={styles.tabBackground} />
                 <View style={styles.glow} />
               </View>
             ),
             tabBarLabelStyle: styles.label,
           }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '  Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="MyServicesScreen"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => <Box size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="VendorOrdersScreen"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="VendorReviewScreen"
        options={{
          title: 'Ratings',
          tabBarIcon: ({ color, size }) => <Star size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="VendorProfile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    overflow: 'visible',
  },
  tabBackgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBackground: {
    width: width - 20,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#ed3237',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    width: width - 10,
    height: 90,
    borderRadius: 30,
    backgroundColor: '#ed3237',
    opacity: 0.18,
    bottom: -15,
    left: 0,
    right: 0,
    zIndex: -1,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    
    letterSpacing: 0.5,
    color: '#fff',
    textShadowColor: '#b30000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});