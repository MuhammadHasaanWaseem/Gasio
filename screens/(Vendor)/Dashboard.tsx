import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  Briefcase,
  Clock,
  DollarSign,
  MessageCircle,
  ShoppingCart
} from "lucide-react-native";
import type { ColorValue } from "react-native";

import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  AppState,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createDashboardStyles } from "./Dashboard.styles";

interface RecentOrder {
  total_price: number;
  order_time: string;
}

interface RecentOrdersState {
  received: RecentOrder | null;
  inProgress: RecentOrder | null;
  completed: RecentOrder | null;
}

export default function VendorDashboard() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createDashboardStyles(width), [width]);
const [totalorder,settotalorder]=useState<any>('');
const { vendorBusiness } = useVendor();
  const [total_earnings,settearning]=useState<number | null>(null);
  const fetchearning  = async () => {
  const { data, error } = await supabase
    .from('vendor_owners')
    .select('total_earning')
    .eq('id', vendor?.id)
    .single();

  if (error) {
    console.log('ERROR', error);
    return;
  }

  settearning(data?.total_earning ?? 0); // ✅ Save only number value
  console.log('Total Earning:', data?.total_earning);
};
  const fetchorder = async () => {
  if (!vendorBusiness?.id) return;

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vendorBusiness.id);

  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }

  settotalorder(data);
};


  const { vendor } = useVendor();
  const [stats, setStats] = useState({
    total_earnings: 0,
    total_orders: 0,
    rating: 0,
    pending_orders: 0,
    services_count: 0,
  });
 const [recentOrders, setRecentOrders] = useState<RecentOrdersState>({
  received: null,
  inProgress: null,
  completed: null,
});
const fetchRecentOrders = async () => {
  if (!vendorBusiness?.id) return;

  try {
    const [received, inProgress, completed] = await Promise.all([
      supabase
        .from("orders")
        .select("total_price, order_time")
        .eq("vendor_id", vendorBusiness.id)
        .eq("status", "Pending")
        .order("order_time", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("orders")
        .select("total_price, order_time")
        .eq("vendor_id", vendorBusiness.id)
        .eq("status", "In Progress")
        .order("order_time", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("orders")
        .select("total_price, order_time")
        .eq("vendor_id", vendorBusiness.id)
        .eq("status", "Completed")
        .order("order_time", { ascending: false })
        .limit(1)
        .single(),
    ]);

    setRecentOrders({
      received: received.data,
      inProgress: inProgress.data,
      completed: completed.data,
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
  }
};

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchDashboardData = async () => {
    if (!vendor?.id) return;

    const { data: vendorRes } = await supabase
      .from("vendors")
      .select("id, total_earnings, total_orders, rating")
      .eq("owner_id", vendor.id)
      .single();

    if (!vendorRes) return;

    const [{ count: pending_orders }, { count: services_count }] =
      await Promise.all([
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendorRes.id)
          .eq("status", "Pending"),
        supabase
          .from("services")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendorRes.id),
      ]);

    setStats({
      total_earnings: vendorRes.total_earnings || 0,
      total_orders: vendorRes.total_orders || 0,
      rating: vendorRes.rating || 0,
      pending_orders: pending_orders || 0,
      services_count: services_count || 0,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (vendorBusiness?.id) {
    fetchRecentOrders();
  }
      fetchorder() // fetching no of orders
      fetchearning();
    if (!vendor?.id) return;

    fetchDashboardData();

    // Supabase Realtime subscription
    const subscription = supabase
      .channel("vendor_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vendors" },
        fetchDashboardData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        fetchDashboardData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        fetchDashboardData
      )
      .subscribe();

    const appStateListener = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        fetchDashboardData();
      }
    });

    return () => {
      supabase.removeChannel(subscription);
      appStateListener.remove();
    };
      

  }, [vendor?.id,vendorBusiness?.id]);


    
    const order=totalorder.length;
  return (
    <View style={styles.container}>
      <StatusBar   barStyle="light-content" />
      {/* Header with 3D effect */}
      <LinearGradient
        colors={['#e91e63', '#ff5252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
         
          <Text style={styles.headerTitle}>Vendor Dashboard</Text>
        <TouchableOpacity 
         onPress={()=>router.push('/sharedchatlist')}
          >

            <MessageCircle color="#fff" size={24} />
        </TouchableOpacity>
        </View>
        
        {/* 3D effect element */}
        <View style={styles.header3DEffect} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Vendor Profile Card */}
        <Animated.View 
          entering={FadeInUp.delay(100).springify()}
          style={styles.profileCard}
        >
          <View style={styles.profileRow}>
            <Image
              source={
                vendor?.profile_picture_url
                  ? {  uri: `${vendor?.profile_picture_url}?t=${Date.now()}` }
                  : require("../../assets/images/placeholder.png")
              }
              style={styles.avatar}
            />
             
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{vendor?.full_name}</Text>
              <View style={styles.ratingContainer}>
                <Activity color="darkblue" size={18} />
                <Text style={styles.ratingText}>Vendor Verified !!</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{order}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.services_count}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${total_earnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Navigation Tabs */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.tabsContainer}
        >
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {(activeTab === 'dashboard') && (
          <Animated.View 
            entering={FadeInUp.delay(300).springify()}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Business Overview</Text>
            <View style={styles.cardsContainer}>
              <DashboardCard
                styles={styles}
                icon={<DollarSign color="#fff" size={24} />}
                title="Total Earnings"
                value={`${'$'} ${total_earnings}`}
                colors={['#4caf50', '#8bc34a']}
                delay={100}
              />
              <DashboardCard
                styles={styles}
                icon={<ShoppingCart color="#fff" size={24} />}
                title="Total Orders"
                value={order}
                colors={['#2196f3', '#03a9f4']}
                delay={200}
              />
              <DashboardCard
                styles={styles}
                icon={<Clock color="#fff" size={24} />}
                title="Pending Orders"
                value={stats.pending_orders}
                colors={['#ff9800', '#ffc107']}
                delay={300}
              />
              <DashboardCard
                styles={styles}
                icon={<Briefcase color="#fff" size={24} />}
                title="Services"
                value={stats.services_count}
                colors={['#9c27b0', '#e91e63']}
                delay={400}
              />
            </View>
            { recentOrders.received !== null && (  
            <Animated.View 
              entering={FadeInUp.delay(400).springify()}
              style={styles.section}
            >
{      recentOrders.received &&        <Text style={styles.sectionTitle}>Recent Activity</Text>
}             <View style={styles.activityCard}>

    {recentOrders.received && (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <ShoppingCart color="#4caf50" size={18} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1} ellipsizeMode="tail">
            New order received
          </Text>
          <Text style={styles.activityTime} numberOfLines={1} ellipsizeMode="tail">
            {new Date(recentOrders.received.order_time).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.activityAmount}>${recentOrders.received.total_price || '0'}</Text>
      </View>
    )}

    {recentOrders.inProgress && (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Clock color="#ff9800" size={18} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1} ellipsizeMode="tail">
            Order in progress
          </Text>
          <Text style={styles.activityTime} numberOfLines={1} ellipsizeMode="tail">
            {new Date(recentOrders.inProgress.order_time).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.activityAmount}>${recentOrders.inProgress.total_price}</Text>
      </View>
    )}

    {recentOrders.completed && (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <DollarSign color="#2196f3" size={18} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1} ellipsizeMode="tail">
            Payment received
          </Text>
          <Text style={styles.activityTime} numberOfLines={1} ellipsizeMode="tail">
            {new Date(recentOrders.completed.order_time).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.activityAmount}>${recentOrders.completed.total_price}</Text>
      </View>
    )}

  </View>
            </Animated.View>)}
            
            <Animated.View 
              entering={FadeInUp.delay(500).springify()}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Best Performance Metrics</Text>
              <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>98%</Text>
                  <Text style={styles.metricLabel}>Completion Rate</Text>
                  <View style={[styles.metricBar, { width: '98%' }]} />
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>4.7</Text>
                  <Text style={styles.metricLabel}>Avg. Rating</Text>
                  <View style={[styles.metricBar, { width: '94%', backgroundColor: '#ffc107' }]} />
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>12 min</Text>
                  <Text style={styles.metricLabel}>Avg. Response Time</Text>
                  <View style={[styles.metricBar, { width: '85%', backgroundColor: '#4caf50' }]} />
                </View>
              </View>
            </Animated.View>
          </Animated.View>
          
        )}
        
        {( activeTab === 'analytics') && (
          <>
           <Animated.View 
  entering={FadeInUp.delay(400).springify()}
  style={styles.section}
>
  <Text style={styles.sectionTitle}>Recent Activity</Text>
  <View style={styles.activityCard}>

    {recentOrders.received && (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <ShoppingCart color="#4caf50" size={18} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1} ellipsizeMode="tail">
            New order received
          </Text>
          <Text style={styles.activityTime} numberOfLines={1} ellipsizeMode="tail">
            {new Date(recentOrders.received.order_time).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.activityAmount}>${recentOrders.received.total_price || '0'}</Text>
      </View>
    )}

    {recentOrders.inProgress && (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Clock color="#ff9800" size={18} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1} ellipsizeMode="tail">
            Order in progress
          </Text>
          <Text style={styles.activityTime} numberOfLines={1} ellipsizeMode="tail">
            {new Date(recentOrders.inProgress.order_time).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.activityAmount}>${recentOrders.inProgress.total_price}</Text>
      </View>
    )}

    {recentOrders.completed && (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <DollarSign color="#2196f3" size={18} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1} ellipsizeMode="tail">
            Payment received
          </Text>
          <Text style={styles.activityTime} numberOfLines={1} ellipsizeMode="tail">
            {new Date(recentOrders.completed.order_time).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.activityAmount}>${recentOrders.completed.total_price}</Text>
      </View>
    )}

  </View>
</Animated.View>

            
            <Animated.View 
              entering={FadeInUp.delay(500).springify()}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Best Performance Metrics</Text>
              <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>98%</Text>
                  <Text style={styles.metricLabel}>Completion Rate</Text>
                  <View style={[styles.metricBar, { width: '98%' }]} />
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>4.7</Text>
                  <Text style={styles.metricLabel}>Avg. Rating</Text>
                  <View style={[styles.metricBar, { width: '94%', backgroundColor: '#ffc107' }]} />
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>12 min</Text>
                  <Text style={styles.metricLabel}>Avg. Response Time</Text>
                  <View style={[styles.metricBar, { width: '85%', backgroundColor: '#4caf50' }]} />
                </View>
              </View>
            </Animated.View>
          </>
        )}
          {( activeTab === 'orders') && (

<View style={styles.cardsContainer}>
              <DashboardCard
                styles={styles}
                icon={<DollarSign color="#fff" size={24} />}
                title="Total Earnings"
                value={`${'$'} ${total_earnings}`}
                colors={['#4caf50', '#8bc34a']}
                delay={100}
              />
              <DashboardCard
                styles={styles}
                icon={<ShoppingCart color="#fff" size={24} />}
                title="Total Orders"
                value={order}
                colors={['#2196f3', '#03a9f4']}
                delay={200}
              />
              <DashboardCard
                styles={styles}
                icon={<Clock color="#fff" size={24} />}
                title="Pending Orders"
                value={stats.pending_orders}
                colors={['#ff9800', '#ffc107']}
                delay={300}
              />
              <DashboardCard
                styles={styles}
                icon={<Briefcase color="#fff" size={24} />}
                title="Services"
                value={stats.services_count}
                colors={['#9c27b0', '#e91e63']}
                delay={400}
              />
            </View>

          )}
      </ScrollView>
    </View>
  );
}


const DashboardCard = ({
  styles,
  icon,
  title,
  value,
  colors = ['#ed3237', '#ff5f6d'],
  delay = 100,
}: {
  styles: any;
  icon: React.ReactNode;
  title: string;
  value: any;
  colors?: [ColorValue, ColorValue, ...ColorValue[]];
  delay?: number;
}) => (
  <Animated.View
    entering={FadeInUp.delay(delay).springify()}
    style={styles.cardWrapper}
  >
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        {icon}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </LinearGradient>
  </Animated.View>
);