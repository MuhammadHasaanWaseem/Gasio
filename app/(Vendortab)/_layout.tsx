import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import {
  Box,
  ClipboardList,
  LayoutDashboard,
  Star,
  User,
} from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#ffdede',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <View
            style={{
              backgroundColor: '#ed3237',
              flex: 1,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: 'hidden',
            }}
          />
        ),
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            height: 60,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          android: {
            height: 60,
            backgroundColor: '#ed3237',
            borderTopWidth: 0,
            elevation: 5,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
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
          title: 'Reviews',
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
