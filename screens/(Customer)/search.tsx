import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function VendorSearchScreen() {
  const [userdata, setUserdata] = useState<any[] | undefined>(undefined);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase.from("vendors").select("*");
    if (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      return;
    } else {
      setUserdata(data);
      setFilteredData(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredData(userdata || []);
      return;
    }
    const filtered = userdata?.filter((item) => {
      const searchText = text.toLowerCase();
      const name = item.name?.toLowerCase() || "";
      const business = item.business_name?.toLowerCase() || "";
      return name.includes(searchText) || business.includes(searchText);
    }) || [];
    setFilteredData(filtered);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search vendors by name or business..."
        value={search}
        onChangeText={handleSearch}
        style={styles.searchInput}
        placeholderTextColor="#999"
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.noResults}>No vendors found</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || item.business_name}</Text>
            <Text style={styles.desc}>{item.description || item.address}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  desc: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  noResults: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});
