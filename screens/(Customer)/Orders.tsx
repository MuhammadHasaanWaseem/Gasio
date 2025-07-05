// import React, { useEffect, useState } from 'react';
// import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { useUser } from '../../context/usercontext';
// import { Order, Service } from '../../interface';
// import { supabase } from '../../lib/supabase';

// const OrdersScreen = () => {
//   const { user } = useUser();
//   const [orders, setOrders] = useState<(Order & { service: Service | null })[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     if (!user) return;
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('orders')
//       .select('*, service:service_id(*)')
//       .eq('user_id', user.id);
//     setLoading(false);
//     if (error) {
//       Alert.alert('Error', 'Failed to fetch orders: ' + error.message);
//     } else {
//       setOrders(data || []);
//     }
//   };

//   const cancelOrder = async (orderId: string) => {
//     setLoading(true);
//     const { error } = await supabase
//       .from('orders')
//       .update({ status: 'Cancelled' })
//       .eq('id', orderId);
//     setLoading(false);
//     if (error) {
//       Alert.alert('Error', 'Failed to cancel order: ' + error.message);
//     } else {
//       Alert.alert('Success', 'Order cancelled');
//       fetchOrders();
//     }
//   };

//   const renderItem = ({ item }: { item: Order & { service: Service | null } }) => {
//     const { service, status, id } = item;
//     if (!service) {
//       return (
//         <View style={styles.item}>
//           <Text style={styles.title}>Service not available</Text>
//           <Text>Status: {status}</Text>
//           {status === 'Pending' && (
//             <TouchableOpacity style={styles.button} onPress={() => cancelOrder(id)}>
//               <Text style={styles.buttonText}>Cancel</Text>
//             </TouchableOpacity>
//           )}
//           {(status === 'Completed' || status === 'In Progress') && (
//             <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Review', 'Go to review screen')}>
//               <Text style={styles.buttonText}>Review</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       );
//     }
//     return (
//       <View style={styles.item}>
//         <Text style={styles.title}>{service.service_name}</Text>
//         <Text>Status: {status}</Text>
//         <Text>Price: ${service.price.toFixed(2)}</Text>
//         {status === 'Pending' && (
//           <TouchableOpacity style={styles.button} onPress={() => cancelOrder(id)}>
//             <Text style={styles.buttonText}>Cancel</Text>
//           </TouchableOpacity>
//         )}
//         {(status === 'Completed' || status === 'In Progress') && (
//           <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Review', 'Go to review screen')}>
//             <Text style={styles.buttonText}>Review</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         ListEmptyComponent={<Text style={styles.empty}>No orders found.</Text>}
//         refreshing={loading}
//         onRefresh={fetchOrders}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'white', padding: 10 },
//   item: {
//     padding: 15,
//     borderBottomColor: '#eee',
//     borderBottomWidth: 1,
//   },
//   title: { fontWeight: 'bold', fontSize: 16 },
//   button: {
//     marginTop: 10,
//     backgroundColor: '#007bff',
//     padding: 10,
//     borderRadius: 5,
//     alignSelf: 'flex-start',
//   },
//   buttonText: { color: 'white' },
//   empty: { textAlign: 'center', marginTop: 20, color: '#999' },
// });

// export default OrdersScreen;
import { router } from 'expo-router';
import { Calendar, Currency, Receipt, Timer } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../../context/usercontext';
import { Order, Service } from '../../interface';
import { supabase } from '../../lib/supabase';

const OrdersScreen = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<(Order & { service: Service | null })[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;
    setRefreshing(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, service:service_id(*)')
      .eq('user_id', user.id)
      .order('order_time', { ascending: false });
    
    setRefreshing(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setOrders(data || []);
    }
  };

  const cancelOrder = async (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('id', orderId);
          
          setLoading(false);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            fetchOrders();
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Cancelled': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const renderItem = ({ item }: { item: Order & { service: Service | null } }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}10` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        
        {item.service ? (
          <>
            <Text style={styles.serviceName}>{item.service.service_name}</Text>
            <View style={styles.orderDetails}>
              <View style={styles.detailItem}>
                <Calendar  size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {new Date(item.order_time).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Timer size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {new Date(item.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Currency size={16} color="#6B7280" />
                <Text style={styles.detailText}>${item.service.price.toFixed(2)}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.serviceName}>Service not available</Text>
        )}
        
        <View style={styles.actionButtons}>
          {item.status === 'Pending' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => cancelOrder(item.id)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
          
          {(item.status === 'Completed' || item.status === 'In Progress') && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => {
                router.push({
                  pathname: '/LeaveReview',
                  params: { orderId: item.id, vendorId: item.vendor_id },
                });
              }}
            >
              <Text style={styles.reviewButtonText}>Leave Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Receipt size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Your orders will appear here</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={fetchOrders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 15,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderId: {
    color: '#6B7280',
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusText: {
    fontWeight: '500',
    fontSize: 14,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '500',
  },
  reviewButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  reviewButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default OrdersScreen;