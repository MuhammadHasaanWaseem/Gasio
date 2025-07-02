import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { BadgeDollarSign, FileText, Plus, Timer } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ServicesScreen() {
  const { vendor, vendorBusiness, loading: vendorLoading } = useVendor();
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("vendor_id", vendorBusiness?.id);

    console.log("fetchServices data:", data, "error:", error);

    if (!error) setServices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!vendorLoading && vendorBusiness?.id) fetchServices();
  }, [vendorBusiness, vendorLoading]);

  if (vendorLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ed3237" />
      </View>
    );
  }

  if (!vendorBusiness) {
    return (
      <View style={{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
  backgroundColor: '#fff',
}}>
  <View style={{
    backgroundColor: '#ffe6e8',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ed3237',
    alignItems: 'center',
    maxWidth: 300,
  }}>
    <Text style={{
      fontSize: 18,
      fontWeight: '700',
      color: '#ed3237',
      marginBottom: 10,
      textAlign: 'center',
    }}>
      No Vendor Profile
    </Text>
    <Text style={{
      color: '#444',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    }}>
      No vendor business information found. Please create your vendor profile to continue.
    </Text>
  </View>
</View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ed3237" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/createservice")}
        >
          <Plus color="#ed3237" size={22} />
        </TouchableOpacity>
      </View>

      {services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No services added yet.</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push("/createservice")}
          >
            <Text style={styles.createBtnText}>+ Add New Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.serviceName}>{item.service_name}</Text>
              <View style={styles.row}>
                <BadgeDollarSign color="#ed3237" size={16} />
                <Text style={styles.text}>${item.price}</Text>
              </View>
              <View style={styles.row}>
                <Timer color="#ed3237" size={16} />
                <Text style={styles.text}>
                  Estimated: {item.estimated_time || "N/A"}
                </Text>
              </View>
              {item.description && (
                <View style={styles.row}>
                  <FileText color="#ed3237" size={16} />
                  <Text style={styles.text}>{item.description}</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ed3237",
  },
  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ed3237",
    borderRadius: 50,
    padding: 6,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: "#ed3237",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#ed3237",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  text: {
    fontSize: 14,
    color: "#444",
  },
});
