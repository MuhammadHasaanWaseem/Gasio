import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function CreateServices() {
  const router = useRouter();
  const { vendorBusiness } = useVendor();

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddService = async () => {
    if (!serviceName || !price) {
      Alert.alert("Validation Error", "Please enter service name and price.");
      return;
    }

    if (!vendorBusiness || !vendorBusiness.id) {
      Alert.alert("Error", "Vendor business information not available.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("services").insert([
      {
        vendor_id: vendorBusiness.id,
        service_name: serviceName,
        description: description,
        price: parseFloat(price),
        estimated_time: estimatedTime,
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Service added successfully.", [
        {
          text: "OK",
          onPress: () => router.push('/(Vendortab)/MyServicesScreen'),
        },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add New Service</Text>

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
          onPress={handleAddService}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Adding..." : "Add Service"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ed3237",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ed3237",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: "#222",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#ed3237",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#f5a1a3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
