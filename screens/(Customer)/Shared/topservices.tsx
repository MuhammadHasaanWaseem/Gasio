import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const TopServicesScreen = () => {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchTopServices = async () => {
    try {
      const { data, error } = await supabase
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
            rating,
            total_orders
          )
        `)
        .order('total_orders', { ascending: false, referencedTable: 'vendors' })
        .limit(20);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching top services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopServices();
  }, []);

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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.title}>Top Services</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.serviceCard}
          onPress={() => router.push({
              pathname:'/bookservice',
              params: { id: item.id }
            })}
          >
          
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.service_name}</Text>
                <Text style={styles.vendorName}>{item.vendors.business_name}</Text>
              </View>
              <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
            </View>
            
            <Text style={styles.serviceDesc} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.serviceFooter}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{item.vendors.rating?.toFixed(1) || 'New'}</Text>
                <Text style={styles.ordersText}>• {item.vendors.total_orders || 0} orders</Text>
              </View>
              <Text style={styles.serviceTime}>
                <Ionicons name="time-outline" size={14} color="#718096" />
                {` ${item.estimated_time}`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={48} color="#CBD5E0" />
            <Text style={styles.emptyText}>No top services available</Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  listContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    color: '#718096',
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C63FF',
  },
  serviceDesc: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 4,
    marginRight: 8,
  },
  ordersText: {
    fontSize: 14,
    color: '#718096',
  },
  serviceTime: {
    fontSize: 14,
    color: '#718096',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#A0AEC0',
    marginTop: 15,
  },
});

export default TopServicesScreen;