import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Service } from '../../interface';
import { supabase } from '../../lib/supabase';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation: any = useNavigation();

  useEffect(() => {
    if (query.length > 2) {
      fetchServices();
    } else {
      setServices([]);
    }
  }, [query]);

  const fetchServices = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('services')
      .select('*')
      .ilike('service_name', `%${query}%`)
      .limit(20);
    
    setLoading(false);
    if (error) {
      console.error('Search error:', error);
    } else {
      setServices(data || []);
    }
  };

  const onServicePress = (service: Service) => {
    navigation.navigate('bookservice', { service });
  };

  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={() => onServicePress(item)}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.title}>{item.service_name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <ChevronRight size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={24} color="#6B7280" />
        <TextInput
          style={styles.input}
          placeholder="Search for services..."
          placeholderTextColor="grey"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ed3237" />
        </View>
      ) : services.length === 0 && query.length > 2 ? (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../assets/images/notfound.jpg')} 
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>No services found</Text>
          <Text style={styles.emptyText}>
            We couldn't find any services matching "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 10,
    color: '#1F2937',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SearchScreen;