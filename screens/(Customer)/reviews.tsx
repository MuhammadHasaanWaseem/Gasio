// import React, { useEffect, useState } from 'react';
// import { Alert, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useUser } from '../../context/usercontext';
// import { Review } from '../../interface';
// import { supabase } from '../../lib/supabase';

// const ReviewsScreen = () => {
//   const { user } = useUser();
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [editingReview, setEditingReview] = useState<Review | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [rating, setRating] = useState('');
//   const [comment, setComment] = useState('');

//   useEffect(() => {
//     fetchReviews();
//   }, []);

//     const fetchReviews = async () => {
//     if (!user) return;
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('reviews')
//       .select('*')
//       .eq('user_id', user.id);
//     setLoading(false);
//     if (error) {
//       Alert.alert('Error', 'Failed to fetch reviews: ' + error.message);
//     } else {
//       setReviews(data || []);
//     }
//   };

//   const openEditModal = (review: Review) => {
//     setEditingReview(review);
//     setRating(review.rating.toString());
//     setComment(review.comment);
//     setModalVisible(true);
//   };

//   const saveReview = async () => {
//     if (!editingReview) return;
//     const updatedRating = parseInt(rating);
//     if (isNaN(updatedRating) || updatedRating < 1 || updatedRating > 5) {
//       Alert.alert('Error', 'Rating must be a number between 1 and 5');
//       return;
//     }
//     setLoading(true);
//     const { error } = await supabase
//       .from('reviews')
//       .update({ rating: updatedRating, comment })
//       .eq('id', editingReview.id);
//     setLoading(false);
//     if (error) {
//       Alert.alert('Error', 'Failed to update review: ' + error.message);
//     } else {
//       Alert.alert('Success', 'Review updated');
//       setModalVisible(false);
//       fetchReviews();
//     }
//   };

//   const deleteReview = async (reviewId: string) => {
//     Alert.alert('Confirm Delete', 'Are you sure you want to delete this review?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           setLoading(true);
//           const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
//           setLoading(false);
//           if (error) {
//             Alert.alert('Error', 'Failed to delete review: ' + error.message);
//           } else {
//             Alert.alert('Success', 'Review deleted');
//             fetchReviews();
//           }
//         },
//       },
//     ]);
//   };

//   const renderItem = ({ item }: { item: Review }) => (
//     <View style={styles.item}>
//       <Text>Rating: {item.rating} stars</Text>
//       <Text>Comment: {item.comment}</Text>
//       <View style={styles.buttons}>
//         <TouchableOpacity style={styles.button} onPress={() => openEditModal(item)}>
//           <Text style={styles.buttonText}>Edit</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteReview(item.id)}>
//           <Text style={styles.buttonText}>Delete</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={reviews}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         ListEmptyComponent={<Text style={styles.empty}>No reviews found.</Text>}
//         refreshing={loading}
//         onRefresh={fetchReviews}
//       />
//       <Modal visible={modalVisible} animationType="slide" transparent={true}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text>Edit Review</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Rating (1-5)"
//               keyboardType="numeric"
//               value={rating}
//               onChangeText={setRating}
//             />
//             <TextInput
//               style={[styles.input, { height: 80 }]}
//               placeholder="Comment"
//               multiline
//               value={comment}
//               onChangeText={setComment}
//             />
//             <Button title="Save" onPress={saveReview} disabled={loading} />
//             <Button title="Cancel" onPress={() => setModalVisible(false)} />
//           </View>
//         </View>
//       </Modal>
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
//   buttons: { flexDirection: 'row', marginTop: 10 },
//   button: {
//     backgroundColor: '#007bff',
//     padding: 10,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   deleteButton: { backgroundColor: '#dc3545' },
//   buttonText: { color: 'white' },
//   empty: { textAlign: 'center', marginTop: 20, color: '#999' },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     margin: 20,
//     padding: 20,
//     borderRadius: 10,
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginVertical: 10,
//   },
// });

// export default ReviewsScreen;
import { Delete, Edit, Pencil, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../../context/usercontext';
import { Review } from '../../interface';
import { supabase } from '../../lib/supabase';

// Custom Star Rating Component
const StarRating = ({ 
  rating, 
  onRatingChange,
  size = 24,
  editable = false
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  editable?: boolean;
}) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <TouchableOpacity 
          key={star} 
          disabled={!editable}
          onPress={() => onRatingChange && onRatingChange(star)}
          activeOpacity={0.7}
        >
          <Star
            size={size}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewsScreen = () => {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setReviews(data || []);
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || '');
    setModalVisible(true);
  };

  const saveReview = async () => {
    if (!editingReview || rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', editingReview.id);
    
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setModalVisible(false);
      fetchReviews();
      Alert.alert('Success', 'Review updated');
    }
  };

  const deleteReview = async (reviewId: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
          setLoading(false);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            fetchReviews();
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <StarRating 
          rating={item.rating} 
          size={20}
          editable={false}
        />
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Edit  size={18} color="#3B82F6" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteReview(item.id)}
        >
          <Delete  size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reviews</Text>
      
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Pencil  size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchReviews}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Your Review</Text>
            
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={32}
              editable={true}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Share your experience..."
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveReview}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
  },
  date: {
    color: '#6B7280',
    fontSize: 14,
  },
  comment: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 10,
  },
  editButtonText: {
    color: '#3B82F6',
    marginLeft: 5,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#EF4444',
    marginLeft: 5,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 15,
    padding: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalRating: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#1F2937',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '500',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#ed3237',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReviewsScreen;