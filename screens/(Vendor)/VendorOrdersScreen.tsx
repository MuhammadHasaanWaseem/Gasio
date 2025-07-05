import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Order {
  id: string;
  user_id: string;
  status: string;
  order_time: string;
  total_price: number ,
  is_paid: boolean;
}

export default function VendorOrdersScreen() {
  const { vendor, vendorBusiness } = useVendor();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!vendorBusiness) return;
    setLoading(true);
    try {
      // Fetch orders with user profile and service details similar to user orders screen
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          status,
          order_time,
          total_price,
          is_paid,
          user_profiles:user_id (
            id,
            full_name,
            avatar_url,
            phone,
            address
          ),
          services:service_id (
            id,
            service_name,
            price,
            estimated_time,
            unit,
            description,
            payment_method
          )
        `)
        .eq("vendor_id", vendorBusiness.id)
        .order("order_time", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "#10B981";
      case "Cancelled":
        return "#EF4444";
      case "Pending":
        return "#F59E0B";
      case "Accepted":
        return "#3B82F6";
      case "In Progress":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case "Completed":
        return "rgba(16, 185, 129, 0.1)";
      case "Cancelled":
        return "rgba(239, 68, 68, 0.1)";
      case "Pending":
        return "rgba(245, 158, 11, 0.1)";
      case "Accepted":
        return "rgba(59, 130, 246, 0.1)";
      case "In Progress":
        return "rgba(139, 92, 246, 0.1)";
      default:
        return "rgba(107, 114, 128, 0.1)";
    }
  };

  const formatPrice = (amount: number) => {
    return `${(amount ?? 0).toFixed(2)}`;  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => router.push(`/orderdetail?id=${item.id}`)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusBackground(item.status) }
          ]}>
            <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.orderDate}>
              {new Date(item.order_time).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="dollar-sign" size={16} color="#6B7280" />
            <Text style={styles.priceText}>{formatPrice(item.total_price)}</Text>
          </View>
        </View>

        <View style={styles.paymentStatus}>
          <Feather
            name={item.is_paid ? "check-circle" : "x-circle"}
            size={20}
            color={item.is_paid ? "#10B981" : "#EF4444"}
          />
          <Text style={styles.paymentText}>
            {item.is_paid ? "Paid" : "Unpaid"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="package" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyText}>Your orders will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Recent Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    padding: 20,
    paddingBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 14,
  },
  orderId: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  orderDetails: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderDate: {
    fontSize: 15,
    color: "#4B5563",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  paymentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
  },
  paymentText: {
    fontSize: 14,
    color: "#4B5563",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});