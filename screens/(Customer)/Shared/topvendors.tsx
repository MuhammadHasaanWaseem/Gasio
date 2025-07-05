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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const TopVendorsScreen = () => {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, business_logo_url, total_orders, total_earnings')
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
      <LinearGradient 
      colors={['#ed3237', '#ff5f6d']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Top Vendors</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f0f9ff', '#e0f2fe']} style={styles.container}>
      <LinearGradient
colors={['#ed3237', '#ff5f6d']}        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Top Vendors</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {vendors.length === 0 ? (
        <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
          <LinearGradient colors={['#ede9fe', '#e0e7ff']} style={styles.emptyCard}>
            <Ionicons name="business-outline" size={48} color="#a78bfa" />
            <Text style={styles.emptyTitle}>No Top Vendors Yet</Text>
            <Text style={styles.emptyText}>The top vendors list will appear here</Text>
          </LinearGradient>
        </Animated.View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(600).delay(index * 100)}>
              <TouchableOpacity
                style={styles.vendorCard}
                onPress={() => router.push({ pathname: '/vendor', params: { id: item.id } })}
              >
                <LinearGradient colors={['#fff', '#f8fafc']} style={styles.cardGradient}>
                  <View style={styles.vendorHeaderCard}>
                    {item.business_logo_url ? (
                      <Image source={{ uri: item.business_logo_url }} style={styles.vendorLogo} />
                    ) : (
                      <LinearGradient
                        colors={['#8b5cf6', '#7c3aed']}
                        style={[styles.vendorLogo, styles.logoPlaceholder]}
                      >
                        <Ionicons name="business" size={28} color="white" />
                      </LinearGradient>
                    )}
                    <View style={styles.vendorInfo}>
                      <Text style={styles.vendorName}>{item.business_name}</Text>
                    </View>
                  </View>

                  <LinearGradient colors={['#ede9fe', '#e0e7ff']} style={styles.earningsContainer}>
                    <Ionicons name="cash-outline" size={18} color="#7c3aed" />
                    <Text style={styles.earningsText}>Continue</Text>
                  </LinearGradient>

                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 18, marginTop: 20, fontWeight: '500' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  vendorCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 30,
    overflow: 'hidden',
  },
  vendorHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  vendorLogo: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#f5f3ff',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 5,
  },
  ordersText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
  },
  earningsText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7c3aed',
    marginLeft: 10,
  },
  rankBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#7c3aed',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default TopVendorsScreen;
