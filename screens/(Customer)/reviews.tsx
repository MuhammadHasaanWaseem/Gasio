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

const StarRating = ({ 
  rating, 
  onRatingChange,
  size = 28,
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
            fill={star <= rating ? '#FFD700' : 'transparent'}
            color={star <= rating ? '#FFD700' : '#d1d5db'}
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
        <View style={styles.ratingDateContainer}>
        <Text style={styles.reviewHeader}>Order# {item.order_id.slice(0, 8).toUpperCase()}</Text>
          <StarRating 
            rating={item.rating} 
            size={20}
            editable={false}
          />
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => openEditModal(item)}
          >
            <Edit size={20} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => deleteReview(item.id)}
          >
            <Delete size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reviews</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Pencil size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyText}>Your reviews will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchReviews}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Your Review</Text>
            
            <View style={styles.starRatingContainer}>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size={36}
                editable={true}
              />
              <Text style={styles.ratingText}>
                {rating === 0 ? 'Tap to rate' : `${rating} Star${rating > 1 ? 's' : ''}`}
              </Text>
            </View>
            
            <Text style={styles.inputLabel}>Your Review</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Share your experience..."
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, rating === 0 && styles.disabledButton]}
                onPress={saveReview}
                disabled={loading || rating === 0}
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
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingDateContainer: {
    flex: 1,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  date: {
    color: '#6B7280',
    fontSize: 14,
  },
  comment: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
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
    maxWidth: 500,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  starRatingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    minHeight: 140,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#1F2937',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ReviewsScreen;