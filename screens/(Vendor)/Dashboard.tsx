import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import {
  Briefcase,
  Clock,
  DollarSign,
  Menu,
  ShoppingCart,
  Star,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function VendorDashboard() {
  const { vendor } = useVendor();
  const [stats, setStats] = useState({
    total_earnings: 0,
    total_orders: 0,
    rating: 0,
    pending_orders: 0,
    services_count: 0,
  });

  const fetchDashboardData = async () => {
    if (!vendor?.id) return;

    const { data: vendorRes } = await supabase
      .from("vendors")
      .select("id, total_earnings, total_orders, rating")
      .eq("owner_id", vendor.id)
      .single();

    if (!vendorRes) return;

    const [{ count: pending_orders }, { count: services_count }] = await Promise.all([
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

  useEffect(() => {
    fetchDashboardData();

    const subscription = supabase
      .channel("vendor_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, fetchDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [vendor]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gasios</Text>
        <Image source={require("../../assets/images/Gasio.png")} style={styles.logo} />
        <Menu color="#ed3237" size={24} />
      </View>

      {/* Vendor Profile Info */}
      <Animated.View entering={FadeInUp.springify()} style={styles.profileRow}>
        <Image
          source={
            vendor?.profile_picture_url
              ? { uri: vendor.profile_picture_url }
              : require("../../assets/images/placeholder.png")
          }
          style={styles.avatar}
        />
        <Text style={styles.vendorName}>{vendor?.full_name}</Text>
      </Animated.View>

      {/* Dashboard Cards */}
      <View style={styles.cardsContainer}>
        <DashboardCard
          icon={<DollarSign color="#fff" size={20} />}
          title="Total Earnings"
          value={`$${stats.total_earnings.toFixed(2)}`}
          delay={100}
        />
        <DashboardCard
          icon={<ShoppingCart color="#fff" size={20} />}
          title="Total Orders"
          value={stats.total_orders}
          delay={200}
        />
        <DashboardCard
          icon={<Clock color="#fff" size={20} />}
          title="Pending Orders"
          value={stats.pending_orders}
          delay={300}
        />
        <DashboardCard
          icon={<Star color="#fff" size={20} />}
          title="Avg. Rating"
          value={<StarRating rating={stats.rating} />}
          delay={400}
        />
        <DashboardCard
          icon={<Briefcase color="#fff" size={20} />}
          title="Services"
          value={stats.services_count}
          delay={500}
        />
      </View>
    </ScrollView>
  );
}

const DashboardCard = ({
  icon,
  title,
  value,
  delay = 100,
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  delay?: number;
}) => (
  <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.cardWrapper}>
    <LinearGradient
      colors={["#ed3237", "#ff5f6d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
    </LinearGradient>
  </Animated.View>
);

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} size={16} fill="#fff" color="#fff" />
      ))}
      {half && <Star size={16} fill="#fff" color="#fff" style={{ opacity: 0.5 }} />}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
        <Star key={i} size={16} color="#ddd" />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ed3237",
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ed3237",
    backgroundColor: "#eee",
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#ed3237",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
});

