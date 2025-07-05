import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const StarRating = ({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.starContainer}>
      {stars.map((star) => (
        <TouchableOpacity 
          key={star} 
          onPress={() => setRating(star)} 
          activeOpacity={0.7}
        >
          <Star 
            size={40} 
            fill={star <= rating ? '#FFD700' : 'transparent'} 
            color={star <= rating ? '#FFD700' : '#d1d5db'} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function LeaveReviewScreen() {
  const { orderId, vendorId } = useLocalSearchParams();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        order_id: orderId,
        vendor_id: vendorId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        rating,
        comment,
        created_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      Alert.alert('Success', 'Your review has been submitted!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'We encountered an issue submitting your review');
      console.error('Submit review error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Experience</Text>
          <Text style={styles.subtitle}>How would you rate this order?</Text>
        </View>

        <View style={styles.ratingCard}>
          <StarRating rating={rating} setRating={setRating} />
          <Text style={styles.ratingText}>
            {rating === 0 ? 'Tap a star to rate' : `${rating} Star${rating > 1 ? 's' : ''}`}
          </Text>
        </View>

        <View style={styles.commentCard}>
          <Text style={styles.label}>Your Review (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What did you like or dislike about your order?"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            rating === 0 && styles.disabledButton
          ]} 
          onPress={submitReview} 
          disabled={loading || rating === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 12,
  },
  textInput: {
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 140,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  charCount: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});