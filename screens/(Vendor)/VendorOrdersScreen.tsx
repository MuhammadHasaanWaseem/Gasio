import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Order {
  id: string;
  user_id: string;
  service_id: string;
  status: string;
  delivery_address: string;
  scheduled_time: string;
  order_time: string;
  total_price: number;
  notes: string;
  is_paid: boolean;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  address: string;
}

interface Service {
  id: string;
  service_name: string;
  price: number;
  estimated_time: string;
  unit: string;
}

export default function OrdersScreen() {
  const { vendor: user } = useVendor();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});
  const [services, setServices] = useState<{ [key: string]: Service }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("vendor_id", user.id)
      .order("order_time", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      return;
    }

    setOrders(ordersData || []);
    await fetchAdditionalData(ordersData || []);
    setLoading(false);
  };

  const fetchAdditionalData = async (orders: Order[]) => {
    const userIds = [...new Set(orders.map((o) => o.user_id))];
    const serviceIds = [...new Set(orders.map((o) => o.service_id))];

    const [{ data: userData }, { data: serviceData }] = await Promise.all([
      supabase.from("user_profiles").select("*").in("id", userIds),
      supabase.from("services").select("*").in("id", serviceIds),
    ]);

    const userMap: any = {};
    const serviceMap: any = {};

    userData?.forEach((u) => (userMap[u.id] = u));
    serviceData?.forEach((s) => (serviceMap[s.id] = s));

    setUserProfiles(userMap);
    setServices(serviceMap);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "#10B981"; // Green
      case "Cancelled": return "#EF4444"; // Red
      case "Pending": return "#F59E0B"; // Amber
      case "Accepted": return "#3B82F6"; // Blue
      case "In Progress": return "#8B5CF6"; // Violet
      default: return "#6B7280"; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const customer = userProfiles[item.user_id];
    const service = services[item.service_id];

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`./orders/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            {customer?.avatar_url ? (
              <Image
                source={{ uri: customer.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={20} color="#6B7280" />
              </View>
            )}
            <View>
              <Text style={styles.customerName}>
                {customer?.full_name || "Customer"}
              </Text>
              <Text style={styles.orderTime}>
                {formatDate(item.order_time)}
              </Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.serviceRow}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {service?.service_name || "Service"}
          </Text>
          <Text style={styles.servicePrice}>
            Rs {item.total_price.toFixed(0)}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {service?.estimated_time || "N/A"}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Feather 
              name={item.is_paid ? "check-circle" : "x-circle"} 
              size={16} 
              color={item.is_paid ? "#10B981" : "#EF4444"} 
            />
            <Text style={[styles.detailText, { color: item.is_paid ? "#10B981" : "#EF4444" }]}>
              {item.is_paid ? "Paid" : "Pending"}
            </Text>
          </View>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <Feather name="message-square" size={16} color="#6B7280" />
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}

        <View style={styles.deliveryRow}>
          <Feather name="map-pin" size={16} color="#6B7280" />
          <Text style={styles.deliveryAddress} numberOfLines={1}>
            {item.delivery_address || "No address provided"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Feather name="refresh-cw" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
              tintColor={"#3B82F6"}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderTime: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
  },
  notesContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
    flex: 1,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  deliveryAddress: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 20,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
});