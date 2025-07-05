import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CategoryScreen = () => {
  const { id } = useLocalSearchParams(); // id is the category name
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const fetchServices = async () => {
  try {
    let query = supabase
      .from('services')
      .select(`
        id,
        service_name,
        description,
        price,
        estimated_time,
        vendor_id,
        vendors!inner(
          business_name,
          business_logo_url,
          rating
        )
      `)
      .order('created_at', { ascending: false });

    // If category is not "Others", apply filter
    const categoryId = Array.isArray(id) ? id[0] : id;
    if (categoryId?.toLowerCase() !== 'others') {
      query = query.or(`category.ilike.%${categoryId}%,tags.ilike.%${categoryId}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    setServices(data || []);
  } catch (error) {
    console.error('Error fetching services:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchServices();
  }, [id]);

  if (loading) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e4e7f1']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e7f1']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{id} Services</Text>
        <Text style={styles.subtitle}>{services.length} services available</Text>
      </View>

      {services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={48} color="#CBD5E0" />
          <Text style={styles.emptyText}>No services found in this category</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                {item.vendors?.business_logo_url ? (
                  <Image
                    source={{ uri: item.vendors.business_logo_url }}
                    style={styles.businessLogo}
                  />
                ) : (
                  <View style={[styles.businessLogo, styles.logoPlaceholder]}>
                    <Ionicons name="business" size={24} color="#6C63FF" />
                  </View>
                )}
                <Text style={styles.businessName}>{item.vendors?.business_name}</Text>
              </View>

              <Text style={styles.serviceName}>{item.service_name}</Text>
              <Text style={styles.serviceDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.serviceFooter}>
                <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.serviceTime}>
                  <Ionicons name="time-outline" size={14} color="#718096" />
                  {` ${item.estimated_time}`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  serviceDesc: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C63FF',
  },
  serviceTime: {
    fontSize: 14,
    color: '#718096',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#A0AEC0',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default CategoryScreen;
