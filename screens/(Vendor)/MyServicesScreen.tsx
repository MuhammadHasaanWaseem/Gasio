import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import {
    BadgeDollarSign,
    ChevronRight,
    Edit,
    FileText,
    PercentIcon,
    Plus,
    SearchIcon,
    Tag,
    Timer,
    X
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function ServicesScreen() {
  const { vendor, vendorBusiness, loading: vendorLoading } = useVendor();
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const fetchServices = async () => {
    if (!vendorBusiness?.id) {
      console.warn('Vendor business ID is undefined, skipping service fetch');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("vendor_id", vendorBusiness.id);

    if (!error) {
      setServices(data || []);
      setFilteredServices(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!vendorLoading && vendorBusiness?.id) fetchServices();
  }, [vendorBusiness, vendorLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service =>
        service.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  const confirmDeleteService = (service: any) => {
    setServiceToDelete(service);
    setDeleteModalVisible(true);
  };

  const deleteService = async () => {
    if (!serviceToDelete) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceToDelete.id);

      if (error) throw error;

      setDeleteModalVisible(false);
      setServiceToDelete(null);
      fetchServices();
      Alert.alert("Success", "Service deleted successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete service.");
    } finally {
      setLoading(false);
    }
  };

  if (vendorLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ed3237" />
      </View>
    );
  }

  if (!vendorBusiness) {
    return (
      <View style={styles.emptyBusinessContainer}>
        <LinearGradient
          colors={['#ffcccc', '#ffe6e6']}
          style={styles.emptyBusinessCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.emptyBusinessTitle}>No Vendor Profile</Text>
          <Text style={styles.emptyBusinessText}>
            Please create your vendor profile to manage services.
          </Text>
          <TouchableOpacity
            style={styles.emptyBusinessButton}
            onPress={() => router.push('/editprofile')}
          >
            <Text style={styles.emptyBusinessButtonText}>Create Vendor Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const renderServiceCard = ({ item }: any) => (
    <Animated.View style={[
      styles.card,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideUpAnim }]
      }
    ]}>
      <View style={styles.cardContent}>
        {/* Card Header */}
        <LinearGradient
          colors={['#ed3237', '#ff5f6d']}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{item.service_name}</Text>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Tag size={12} color="#fff" />
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <PercentIcon size={16} fill="#ffc107" color="#ffc107" />
           
              <Text style={styles.ratingText}>{item.discount || '0'}</Text>
           
          </View>
        </LinearGradient>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <BadgeDollarSign color="#ed3237" size={16} />
              <Text style={styles.detailText}>${item.price}</Text>
            </View>

            {item.estimated_time && (
              <View style={styles.detailItem}>
                <Timer color="#ed3237" size={16} />
                <Text style={styles.detailText}>{item.estimated_time}</Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.availabilityText}>{item.availability_}</Text>
            </View>
          </View>

          {item.description && (
            <View style={styles.descriptionContainer}>
              <FileText color="#5e72e4" size={16} />
              <Text style={styles.descriptionText} numberOfLines={2}>Description {item.description}</Text>
            </View>
          )}

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/createservice",
                  params: { service: JSON.stringify(item) }
                });
              }}
            >
              <Edit size={18} color="#5e72e4" />
              <Text style={styles.editButtonText}>Edit Service</Text>
              <ChevronRight size={18} color="#5e72e4" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDeleteService(item)}
            >
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <LinearGradient
        colors={['#e91e63', '#ff5252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.header3DEffect} />
        <Text style={styles.title}>My Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/createservice");
          }}
        >
          <Plus color="#fff" size={22} />
        </TouchableOpacity>
      </LinearGradient>
<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  }}
>
  <SearchIcon color="grey" size={20} style={{ marginRight: 10 }} />

  <TextInput
    style={{
      flex: 1,
      fontSize: 16,
      color: "#333",
      paddingVertical: 6,
    }}
    placeholder="Search services..."
    placeholderTextColor="#999"
    value={searchQuery}
    onChangeText={setSearchQuery}
    clearButtonMode="while-editing"
  />

  {searchQuery !== "" && (
    <TouchableOpacity onPress={() => setSearchQuery("")}>
      <X color="grey" size={20} />
    </TouchableOpacity>
  )}
</View>
      {filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration} />
          <Text style={styles.emptyTitle}>No Services Found</Text>
          <Text style={styles.emptyText}>Try adjusting your search or add new services.</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push("/createservice")}
          >
            <Text style={styles.createBtnText}>+ Add New Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
          renderItem={renderServiceCard}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/createservice")}
      >
        <LinearGradient
          colors={['#ed3237', '#ff5f6d']}
          style={styles.floatingButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus color="#fff" size={28} />
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this service?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={deleteService}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 0,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ed3237",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#444",
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#ed3237",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteConfirmButton: {
    backgroundColor: "#ed3237",
  },
  deleteConfirmButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    zIndex: 10,
  },
  header3DEffect: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    height: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
    opacity: 0.7,
    zIndex: -1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIllustration: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f5ff',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 300,
  },
  createBtn: {
    backgroundColor: "#ed3237",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    elevation: 15,
    shadowColor: "#3f51b5",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    zIndex: 5,
  },
  cardContent: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginRight: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
  },
  cardBody: {
    backgroundColor: "#fff",
    padding: 25,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 15,
    color: "#555",
    fontWeight: '600',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  descriptionContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f5ff',
    borderRadius: 12,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: "#5e72e4",
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  editButtonText: {
    color: '#5e72e4',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 10,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  emptyBusinessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  emptyBusinessCard: {
    padding: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ed3237',
    maxWidth: width - 60,
    elevation: 10,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    alignItems: 'center',
  },
  emptyBusinessTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ed3237',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyBusinessText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  emptyBusinessButton: {
    backgroundColor: "#ed3237",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  emptyBusinessButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});