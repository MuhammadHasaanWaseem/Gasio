import { HapticTab } from '@/components/HapticTab';
import { Tabs } from 'expo-router';
import {
  ClipboardList,
  Home,
  Search,
  Star,
  User,
} from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function TabLayout() {
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'home',
          tabBarIcon: ({ color }) => <Home size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Orders"
        options={{
          title: 'Vendor Orders',
          tabBarIcon: ({ color }) => <ClipboardList size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Vendor Review',
          tabBarIcon: ({ color }) => <Star size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Vendor Profile',
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
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
    fontSize: 12,
    fontWeight: '700',
    
    letterSpacing: 0.5,
    color: '#fff',
    textShadowColor: '#b30000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});