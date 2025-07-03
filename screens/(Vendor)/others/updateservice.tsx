// EditServiceScreen.js
import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { vendorBusiness } = useVendor();

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      (async () => {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          Alert.alert("Error", "Failed to load service");
        } else if (data) {
          setServiceName(data.service_name);
          setDescription(data.description || "");
          setPrice(data.price.toString());
          setEstimatedTime(data.estimated_time || "");
        }
      })();
    }
  }, [id]);

  const handleUpdateService = async () => {
    if (!serviceName || !price) {
      Alert.alert("Validation Error", "Please enter service name and price.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("services")
      .update({
        service_name: serviceName,
        description,
        price: parseFloat(price),
        estimated_time: estimatedTime,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Service updated successfully.", [
        { text: "OK", onPress: () => router.push("/(Vendortab)/MyServicesScreen") },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <LinearGradient
        colors={['#e91e63', '#ff5252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Edit Service</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Service Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter service name"
            value={serviceName}
            onChangeText={setServiceName}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Estimated Time</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter estimated time (e.g., 30 mins)"
            value={estimatedTime}
            onChangeText={setEstimatedTime}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdateService}
            disabled={loading}
          >
            <LinearGradient
              colors={['#ed3237', '#ff5f6d']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>{loading ? "Updating..." : "Update Service"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc" },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 12,
    shadowColor: '#d81b60',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: 'center',
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scrollContainer: { padding: 20, paddingTop: 30, paddingBottom: 50 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    elevation: 10,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
    backgroundColor: '#f9f9f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 8,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonGradient: { paddingVertical: 16, alignItems: "center" },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
