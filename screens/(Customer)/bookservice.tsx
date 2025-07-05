// import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
// import React, { useState } from 'react';
// import { Alert, Button, StyleSheet, Text, View } from 'react-native';
// import { useUser } from '../../context/usercontext';
// import { Service } from '../../interface';
// import { supabase } from '../../lib/supabase';

// type BookServiceRouteProp = RouteProp<{ params: { service: Service } }, 'params'>;

// const BookServiceScreen = () => {
//   const route = useRoute<BookServiceRouteProp>();
//   const navigation = useNavigation();
//   const { user } = useUser();
//   const service = route.params.service;
//   const [loading, setLoading] = useState(false);

//     const confirmBooking = async () => {
//     if (!user) {
//       Alert.alert('Error', 'User not logged in');
//       return;
//     }
//     setLoading(true);
//     const { data, error } = await supabase.from('orders').insert([
//       {
//         service_id: service.id,
//         user_id: user.id,
//         vendor_id: service.vendor_id,
//         status: 'Pending',
//       },
//     ]);
//     setLoading(false);
//     if (error) {
//       Alert.alert('Error', 'Failed to book service: ' + error.message);
//     } else {
//       Alert.alert('Success', 'Service booked successfully');
//       navigation.goBack();
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{service.title}</Text>
//       <Text style={styles.description}>{service.description}</Text>
//       <Text style={styles.price}>Price: ${service.price.toFixed(2)}</Text>
//       <Button title={loading ? 'Booking...' : 'Confirm Booking'} onPress={confirmBooking} disabled={loading} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'white', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
//   description: { fontSize: 16, marginBottom: 10 },
//   price: { fontSize: 18, color: 'green', marginBottom: 20 },
// });

// export default BookServiceScreen;
import { useVendor } from '@/context/vendorcontext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, TimerIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../../context/usercontext';
import { Service } from '../../interface';
import { supabase } from '../../lib/supabase';

type BookServiceRouteProp = RouteProp<{ params: { service: Service } }, 'params'>;

const BookServiceScreen = () => {
  const route = useRoute<BookServiceRouteProp>();
  const navigation = useNavigation();
  const { user } = useUser();
  const {vendor}=useVendor()
  const service = route.params.service;
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const confirmBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to book services');
      return;
    }
    
    if (!date || !time) {
      Alert.alert('Missing Information', 'Please select date and time');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.from('orders').insert([
      {
        service_id: service.id,
        user_id: user.id,
        vendor_id: service.vendor_id,
        status: 'Pending',
        notes,
        scheduled_time: `${date} ${time}`,
        total_price: service.price,
      },
    ]);
    setLoading(false);
    
    if (error) {
      Alert.alert('Booking Failed', error.message);
    } else {
      Alert.alert('Success', 'Service booked successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Book Service</Text>
      
      <View style={styles.card}>
        <Text style={styles.serviceTitle}>{service.service_name}</Text>
        <Text style={styles.description}>{service.description}</Text>
    <View>
    <Text style={styles.sectionTitle}>Payment method</Text>
     <Text style={styles.description}>{service.payment_method}</Text>
    </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price:</Text>
          <Text style={styles.price}>${service.price.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Schedule Your Service</Text>
        
        <View style={styles.inputRow}>
          <Calendar size={20} color="#ed3237" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Select date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputRow}>
          <TimerIcon size={20} color="#ed3237" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Select time (HH:MM)"
            value={time}
            onChangeText={setTime}
            placeholderTextColor="#999"
          />
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Special Instructions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add any special requests or notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholderTextColor="#999"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={confirmBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 15,
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 18,
    color: '#6B7280',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  bookButton: {
    backgroundColor: '#ed3237',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookServiceScreen;