import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

const TopVendorsScreen = () => {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchTopVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, business_logo_url, rating, total_orders, total_earnings')
        .order('rating', { ascending: false })
        .order('total_orders', { ascending: false })
        .limit(20);

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching top vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopVendors();
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
        <Text style={styles.title}>Top Vendors</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.vendorCard}
            onPress={() => router.push(
              {
                pathname:'/vendor',
                params:{id:item.id}
              }
            )}
          >
            <View style={styles.vendorHeader}>
              {item.business_logo_url ? (
                <Image 
                  source={{ uri: item.business_logo_url }} 
                  style={styles.vendorLogo} 
                />
              ) : (
                <View style={[styles.vendorLogo, styles.logoPlaceholder]}>
                  <Ionicons name="business" size={32} color="#6C63FF" />
                </View>
              )}
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{item.business_name}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.statText}>{item.rating?.toFixed(1) || 'New'}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="cart" size={16} color="#4C51BF" />
                    <Text style={styles.statText}>{item.total_orders || 0}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.earningsContainer}>
              <Text style={styles.earningsText}>
                Total Earnings: ${item.total_earnings?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color="#CBD5E0" />
            <Text style={styles.emptyText}>No top vendors available</Text>
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
  vendorCard: {
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
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  logoPlaceholder: {
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 4,
  },
  earningsContainer: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  earningsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38A169',
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

export default TopVendorsScreen;