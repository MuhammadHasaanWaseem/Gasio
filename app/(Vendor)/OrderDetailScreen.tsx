import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
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
  description: string;
}

const statusOptions = [
  "Pending",
  "Accepted",
  "In Progress",
  "Completed",
  "Cancelled",
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { vendor } = useVendor();

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string" && id !== "undefined") {
      fetchOrderDetails();
    } else {
      setLoading(false);
      setOrder(null);
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);

    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError || !orderData) {
        throw orderError || new Error("Order not found");
      }

      // Check if order belongs to current vendor
      if (vendor && orderData.vendor_id !== vendor.id) {
        Alert.alert("Unauthorized", "You do not have access to this order.");
        setOrder(null);
        setCustomer(null);
        setService(null);
        setLoading(false);
        return;
      }

      setOrder(orderData as Order);

      // Fetch customer and service in parallel
      const [customerResult, serviceResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("*")
          .eq("id", orderData.user_id)
          .single(),
        supabase
          .from("services")
          .select("*")
          .eq("id", orderData.service_id)
          .single(),
      ]);

      if (customerResult.error || !customerResult.data) {
        console.error("Customer fetch error:", customerResult.error);
        setCustomer(null);
      } else {
        setCustomer(customerResult.data as UserProfile);
      }

      if (serviceResult.error || !serviceResult.data) {
        console.error("Service fetch error:", serviceResult.error);
        setService(null);
      } else {
        setService(serviceResult.data as Service);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Could not fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order || !vendor) return;

    Alert.alert(
      "Confirm Status Update",
      `Are you sure you want to update the order status to "${newStatus}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: async () => {
            setUpdating(true);
            try {
              const { error } = await supabase
                .from("orders")
                .update({ status: newStatus })
                .eq("id", order.id);

              if (error) throw error;

              setOrder({ ...order, status: newStatus });

              Alert.alert("Success", `Order status updated to ${newStatus}`);
            } catch (error) {
              console.error("Error updating order status:", error);
              Alert.alert("Error", "Could not update order status");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "#10B981"; // Green
      case "Cancelled":
        return "#EF4444"; // Red
      case "Pending":
        return "#F59E0B"; // Amber
      case "Accepted":
        return "#3B82F6"; // Blue
      case "In Progress":
        return "#8B5CF6"; // Violet
      default:
        return "#6B7280"; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="alert-circle" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>Order not found</Text>
        <Text style={styles.emptyText}>The requested order could not be found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.id.slice(0, 8)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Order Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID:</Text>
            <Text style={styles.infoValue}>{order.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date:</Text>
            <Text style={styles.infoValue}>{formatDate(order.order_time)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Scheduled:</Text>
            <Text style={styles.infoValue}>
              {order.scheduled_time ? formatDate(order.scheduled_time) : "Not scheduled"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment:</Text>
            <View style={styles.paymentStatus}>
              <Feather
                name={order.is_paid ? "check-circle" : "x-circle"}
                size={20}
                color={order.is_paid ? "#10B981" : "#EF4444"}
              />
              <Text style={[styles.paymentText, { color: order.is_paid ? "#10B981" : "#EF4444" }]}>
                {order.is_paid ? "Paid" : "Payment Pending"}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={styles.totalPrice}>Rs {order.total_price.toFixed(0)}</Text>
          </View>
        </View>

        {/* Customer Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Information</Text>
          <View style={styles.divider} />

          <View style={styles.customerInfo}>
            {customer?.avatar_url ? (
              <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={24} color="#6B7280" />
              </View>
            )}
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{customer?.full_name || "Customer"}</Text>
              <Text style={styles.customerPhone}>{customer?.phone || "No phone provided"}</Text>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <Feather name="map-pin" size={18} color="#6B7280" style={styles.addressIcon} />
            <Text style={styles.addressText}>
              {order.delivery_address || customer?.address || "No address provided"}
            </Text>
          </View>
        </View>

        {/* Service Card */}
        {service && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Details</Text>
            <View style={styles.divider} />

            <Text style={styles.serviceName}>{service.service_name}</Text>

            {service.description && <Text style={styles.serviceDescription}>{service.description}</Text>}

            <View style={styles.serviceDetails}>
              <View style={styles.detailItem}>
                <Feather name="clock" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{service.estimated_time}</Text>
              </View>

              <View style={styles.detailItem}>
                <Feather name="tag" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{service.unit}</Text>
              </View>

              <View style={styles.detailItem}>
                <Feather name="dollar-sign" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Rs {service.price.toFixed(0)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Notes */}
        {order.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Notes</Text>
            <View style={styles.divider} />
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        {/* Status Update */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Order Status</Text>
          <View style={styles.divider} />

          <View style={styles.statusButtonsContainer}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  order.status === status && styles.activeStatusButton,
                  updating && styles.disabledButton,
                ]}
                onPress={() => updateOrderStatus(status)}
                disabled={updating || order.status === status}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    order.status === status && styles.activeStatusButtonText,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {updating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.updatingText}>Updating status...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerBackButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  paymentStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 6,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 15,
    color: "#4B5563",
  },
  addressContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressText: {
    fontSize: 15,
    color: "#4B5563",
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 22,
  },
  serviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
  },
  notesText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  statusButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusButton: {
    width: "48%",
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  activeStatusButton: {
    backgroundColor: "#3B82F6",
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
  },
  activeStatusButtonText: {
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
  updatingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  updatingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F9FAFB",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 20,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
