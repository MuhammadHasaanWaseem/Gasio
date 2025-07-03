import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { Star, StarHalf } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  order_id: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
}

export default function ReviewsScreen() {
  const { vendor: vendorUser } = useVendor();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: [0, 0, 0, 0, 0]
  });

  const fetchReviews = async () => {
    if (!vendorUser?.id) return;
    setLoading(true);

    try {
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("vendor_id", vendorUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(reviewsData || []);

      // Calculate stats
      if (reviewsData && reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
        const average = sum / total;
        
        const counts = [0, 0, 0, 0, 0];
        reviewsData.forEach(review => {
          if (review.rating >= 1 && review.rating <= 5) {
            counts[5 - Math.floor(review.rating)]++;
          }
        });
        
        setStats({
          averageRating: parseFloat(average.toFixed(1)),
          totalReviews: total,
          ratingCounts: counts
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingCounts: [0, 0, 0, 0, 0]
        });
      }

      // Fetch user profiles
      const userIds = [...new Set(reviewsData?.map(r => r.user_id))];
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("user_profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const userMap: any = {};
        users?.forEach(u => (userMap[u.id] = u));
        setUserProfiles(userMap);
      }
    } catch (error) {
      console.error("Review fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={size} color="#FFD700" fill="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} size={size} color="#FFD700" fill="#FFD700" />);
      } else {
        stars.push(<Star key={i} size={size} color="#E5E7EB" />);
      }
    }
    
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const renderRatingBar = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>{stars} star</Text>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingCount}>{count}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Review }) => {
    const user = userProfiles[item.user_id];
    
    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={20} color="#6B7280" />
            </View>
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.full_name || "Customer"}</Text>
            <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>
        </View>
        
        {item.comment ? (
          <Text style={styles.comment}>{item.comment}</Text>
        ) : (
          <Text style={styles.noComment}>No comment provided</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Reviews</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Feather name="refresh-cw" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-square" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyText}>Your reviews will appear here</Text>
        </View>
      ) : (
        <ScrollView>
          {/* Rating Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.ratingSummary}>
              <Text style={styles.averageRating}>{stats.averageRating}</Text>
              <View style={styles.ratingStars}>
                {renderStars(stats.averageRating, 20)}
              </View>
              <Text style={styles.totalReviews}>{stats.totalReviews} reviews</Text>
            </View>
            
            <View style={styles.ratingBars}>
              {renderRatingBar(5, stats.ratingCounts[0], stats.totalReviews)}
              {renderRatingBar(4, stats.ratingCounts[1], stats.totalReviews)}
              {renderRatingBar(3, stats.ratingCounts[2], stats.totalReviews)}
              {renderRatingBar(2, stats.ratingCounts[3], stats.totalReviews)}
              {renderRatingBar(1, stats.ratingCounts[4], stats.totalReviews)}
            </View>
          </View>

          {/* Reviews List */}
          <Text style={styles.reviewsTitle}>All Reviews</Text>
          <FlatList
            data={reviews}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 20,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
  },
  ratingSummary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#F3F4F6",
    paddingRight: 20,
  },
  averageRating: {
    fontSize: 42,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 48,
  },
  ratingStars: {
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: "#6B7280",
  },
  ratingBars: {
    flex: 2,
    paddingLeft: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingLabel: {
    width: 60,
    fontSize: 14,
    color: "#6B7280",
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
  },
  ratingCount: {
    width: 30,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "right",
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  listContainer: {
    paddingBottom: 32,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewDate: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  ratingContainer: {
    justifyContent: "center",
  },
  comment: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  noComment: {
    fontSize: 15,
    color: "#9CA3AF",
    fontStyle: "italic",
    lineHeight: 22,
  },
});