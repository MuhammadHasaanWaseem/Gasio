import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          service_name,
          description,
          price,
          estimated_time,
          unit,
          discount,
          max_quantity,
          tags,
          vendor_id,
          vendors!inner(
            id,
            address,
            business_name,
            business_logo_url,
            rating,
            total_orders
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  if (loading || !service) {
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.title}>{service.service_name}</Text>
          <View style={{ width: 24 }} />
        </View>

        

        {/* Service Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.serviceName}>{service.service_name}</Text>
          <Text style={styles.price}>${service.price.toFixed(2)}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#718096" />
            <Text style={styles.infoText}>Estimated time: {service.estimated_time}</Text>
          </View>
           <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#718096" />
            <Text style={styles.infoText}>Location: {service.vendors?.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={20} color="#718096" />
            <Text style={styles.infoText}>Unit: {service.unit}</Text>
          </View>
          
          {service.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{service.discount}% OFF</Text>
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{service.description || 'No description available'}</Text>
        </View>

        {/* Vendor Info */}
        <View style={styles.vendorCard}>
          <Text style={styles.sectionTitle}>Service Provider</Text>
          <TouchableOpacity 
            style={styles.vendorInfo}
            // onPress={() => router.push(`/vendor/${service.vendor_id}` as any)}
          >
            {service.vendors.business_logo_url ? (
              <Image 
                source={{ uri: service.vendors.business_logo_url }} 
                style={styles.vendorLogo} 
              />
            ) : (
              <View style={[styles.vendorLogo, styles.logoPlaceholder]}>
                <Ionicons name="business" size={32} color="#6C63FF" />
              </View>
            )}
            <View style={styles.vendorDetails}>
              <Text style={styles.vendorName}>{service.vendors.business_name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{service.vendors.rating?.toFixed(1) || 'New'}</Text>
                <Text style={styles.ordersText}>• {service.vendors.total_orders || 0} orders</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity onPress={()=>router.back()} style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Go back</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 16,
  },
  imageText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 10,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F56565',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorDetails: {
    flex: 1,
    marginLeft: 16,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 4,
    marginRight: 10,
  },
  ordersText: {
    fontSize: 16,
    color: '#718096',
  },
  bookButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
;