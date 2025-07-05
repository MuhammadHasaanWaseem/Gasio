import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';

interface Vendor {
  id: string;
  business_name: string;
}

const VendorSearch = ({ navigation }: any) => {
  const [searchText, setSearchText] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (searchText.length > 2) {
      searchVendors(searchText);
    } else {
      setVendors([]);
    }
  }, [searchText]);

  const searchVendors = async (query: string) => {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, business_name')
      .ilike('business_name', `%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching vendors:', error);
    } else {
      setVendors(data || []);
    }
  };

  const openChatWithVendor = (vendorId: string, vendorName: string) => {
    navigation.navigate('Chat', { vendorId, vendorName });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search vendors..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.vendorItem}
            onPress={() => openChatWithVendor(item.id, item.business_name)}
          >
            <Text style={styles.vendorName}>{item.business_name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No vendors found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  vendorItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  vendorName: { fontSize: 18 },
});

export default VendorSearch;
