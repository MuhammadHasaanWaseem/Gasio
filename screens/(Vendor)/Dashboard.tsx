import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import {
  Briefcase,
  Clock,
  DollarSign,
  MessageCircle,
  ShoppingCart,
  Star
} from "lucide-react-native";
import type { ColorValue } from "react-native";

import React, { useEffect, useState } from "react";
import {
  AppState,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
;
interface RecentOrder {
  total_price: number;
  order_time: string;
}

interface RecentOrdersState {
  received: RecentOrder | null;
  inProgress: RecentOrder | null;
  completed: RecentOrder | null;
}
const { width } = Dimensions.get('window');

export default function VendorDashboard() {

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
      {/* Header with 3D effect */}
      <LinearGradient
        colors={['#e91e63', '#ff5252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
         
          <Text style={styles.headerTitle}>Vendor Dashboard</Text>
        <TouchableOpacity 
        // onPress={()=>router.push('/vendormessage')}
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
                <Star size={18} fill="#ffc107" color="#ffc107" />
                <Text style={styles.ratingText}>{stats.rating.toFixed(1)}</Text>
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
                icon={<DollarSign color="#fff" size={24} />}
                title="Total Earnings"
                value={`${'$'} ${total_earnings}`}
                colors={['#4caf50', '#8bc34a']}
                delay={100}
              />
              <DashboardCard
                icon={<ShoppingCart color="#fff" size={24} />}
                title="Total Orders"
                value={order}
                colors={['#2196f3', '#03a9f4']}
                delay={200}
              />
              <DashboardCard
                icon={<Clock color="#fff" size={24} />}
                title="Pending Orders"
                value={stats.pending_orders}
                colors={['#ff9800', '#ffc107']}
                delay={300}
              />
              <DashboardCard
                icon={<Briefcase color="#fff" size={24} />}
                title="Services"
                value={stats.services_count}
                colors={['#9c27b0', '#e91e63']}
                delay={400}
              />
            </View>
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
          <Text style={styles.activityTitle}>New order received</Text>
          <Text style={styles.activityTime}>
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
          <Text style={styles.activityTitle}>Order in progress</Text>
          <Text style={styles.activityTime}>
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
          <Text style={styles.activityTitle}>Payment received</Text>
          <Text style={styles.activityTime}>
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
          <Text style={styles.activityTitle}>New order received</Text>
          <Text style={styles.activityTime}>
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
          <Text style={styles.activityTitle}>Order in progress</Text>
          <Text style={styles.activityTime}>
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
          <Text style={styles.activityTitle}>Payment received</Text>
          <Text style={styles.activityTime}>
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
                icon={<DollarSign color="#fff" size={24} />}
                title="Total Earnings"
                value={`${'$'} ${total_earnings}`}
                colors={['#4caf50', '#8bc34a']}
                delay={100}
              />
              <DashboardCard
                icon={<ShoppingCart color="#fff" size={24} />}
                title="Total Orders"
                value={order}
                colors={['#2196f3', '#03a9f4']}
                delay={200}
              />
              <DashboardCard
                icon={<Clock color="#fff" size={24} />}
                title="Pending Orders"
                value={stats.pending_orders}
                colors={['#ff9800', '#ffc107']}
                delay={300}
              />
              <DashboardCard
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
  icon,
  title,
  value,
  colors = ['#ed3237', '#ff5f6d'],
  delay = 100,
}: {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 12,
    shadowColor: '#d81b60',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    zIndex: 10,
    overflow: 'hidden',
  },
  header3DEffect: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 25,
    backgroundColor: '#d81b60',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.7,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
    marginLeft: 10,
  },
  logo: {
    width: 50,
    height: 100,
    resizeMode: 'contain',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    marginBottom: 20,
    transform: [{ translateY: -20 }],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#e91e63',
    backgroundColor: '#eee',
  },
  vendorInfo: {
    marginLeft: 15,
    flex: 1,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff9800',
    marginLeft: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    elevation: 5,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#e91e63',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardWrapper: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    height: 150,
    justifyContent: 'space-between',
  },
  cardHeader: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 5,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  activityTime: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  metricBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196f3',
  },
});