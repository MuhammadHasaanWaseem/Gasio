import { useVendor } from '@/context/vendorcontext';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronDown, ChevronLeft, ChevronUp, Clock, DollarSign, Info, Tag, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PaymentMethodsActionSheet from './actionSheets';
const { width, height } = Dimensions.get('window');
type Service = {
  payment_method: string;
  id?: string;
  service_name?: string;
  description?: string;
  price?: number;
  estimated_time?: string;
  category?: string;
  unit?: string;
  discount?: number;
  max_quantity?: number;
  tags?: string[];
  is_featured?: boolean;
  addons?: any[];
  service_radius?: string;
};

export default function CreateServices() {
  const { service: serviceParam } = useLocalSearchParams();
  const service: Service | null = serviceParam ? JSON.parse(serviceParam as string) : null;
  const router = useRouter();
  const {vendor:user, vendorBusiness} = useVendor();
  // Form states
  const [serviceName, setServiceName] = useState(service?.service_name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [price, setPrice] = useState(service?.price?.toString() || "");
  const [estimatedTime, setEstimatedTime] = useState(service?.estimated_time || "");
  const [category, setCategory] = useState(service?.category || "Gas Delivery");
  const [serviceCode, setServiceCode] = useState(service?.id ? `SVC-${service.id.substring(0, 8)}` : "SVC-NEW");
  const [availability, setAvailability] = useState("In Stock");
  
  // New fields
  const [unit, setUnit] = useState(service?.unit || "Per Delivery");
  const [discount, setDiscount] = useState(service?.discount?.toString() || "");
  const [maxQuantity, setMaxQuantity] = useState(service?.max_quantity?.toString() || "");
const [tags, setTags] = useState(Array.isArray(service?.tags) ? service.tags.join(", ") : "");
  const [isFeatured, setIsFeatured] = useState(service?.is_featured || false);
  const [serviceRadius, setServiceRadius] = useState(service?.service_radius || "");
  const [addons, setAddons] = useState<any[]>(service?.addons || []);
const [paymentMethods, setPaymentMethods] = useState<string[]>(

  typeof service?.payment_method === "string"

    ? service.payment_method.split(",").map((p: string) => p.trim())

    : Array.isArray(service?.payment_method)

      ? service.payment_method

      : []

);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const paymentMethodsOptions = [
    "Jazzcash",
    "Easypaisa",
    "Nayab Pay",
    "Bank Account"
  ];
  const [isFocused, setIsFocused] = useState({
    serviceName: false,
    description: false,
    price: false,
    estimatedTime: false,
    discount: false,
    maxQuantity: false,
    tags: false,
    serviceRadius: false
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  
  const categories = [
    "Gas Delivery",
    "Installation",
    "Maintenance",
    "Emergency",
    "Consultation",
    "Other",
  ];

  const unitOptions = [
    "Per Delivery",
    "Per Hour",
    "Per Item",
    "Per KG",
    "Per Service",
    "Fixed Price"
  ];

  const availabilityOptions = [
    "In Stock",
    "Low Stock",
    "Out of Stock",
    "Pre-order"
  ];

  useEffect(() => {
    // Entry animations
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
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleFocus = (field: string) => {
    setIsFocused(prev => ({...prev, [field]: true}));
  };

  const handleBlur = (field: string) => {
    setIsFocused(prev => ({...prev, [field]: false}));
  };

  const handleAddService = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!serviceName || !price) {
      Alert.alert("Validation Error", "Please enter service name and price.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Validation Error", "Vendor ID is missing. Please ensure you are logged in as a vendor.");
      return;
    }

    setLoading(true);

    // Remove joining payment methods into string; keep as array for Supabase text[] column
    // const payment_method_str = paymentMethods.join(", ");

    const serviceData = {
      service_name: serviceName,
      description,
      price: parseFloat(price),
      estimated_time: estimatedTime,
      category,
      unit,
      discount: discount ? parseFloat(discount) : null,
      max_quantity: maxQuantity ? parseInt(maxQuantity) : null,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      is_featured: isFeatured,
      service_radius: serviceRadius,
      addons,
      availability_: availability,
      payment_method: paymentMethods, // send as array directly
      vendor_id: vendorBusiness?.id || null, // use vendorBusiness id for vendor_id foreign key
    };

    try {
      let response;
      if (service && service.id) {
        response = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);
      } else {
        response = await supabase
          .from('services')
          .insert(serviceData);
      }

      if (response.error) {
        throw response.error;
      }

      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", service ? "Service updated!" : "Service added!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to save service.");
    }
  };

  const toggleDropdown = (dropdownType: 'category' | 'unit' | 'payment') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (dropdownType === 'category') {
      setShowCategoryDropdown(!showCategoryDropdown);
      setShowUnitDropdown(false);
      setShowPaymentDropdown(false);
    } else if (dropdownType === 'unit') {
      setShowUnitDropdown(!showUnitDropdown);
      setShowCategoryDropdown(false);
      setShowPaymentDropdown(false);
    } else if (dropdownType === 'payment') {
      setShowPaymentDropdown(!showPaymentDropdown);
      setShowCategoryDropdown(false);
      setShowUnitDropdown(false);
    }
  };

  const renderDropdownItem = (item: string, type: 'category' | 'unit' | 'payment') => {
    const isSelected = type === 'category' ? category === item : type === 'unit' ? unit === item : paymentMethods.includes(item);
    return (
      <TouchableOpacity
        key={item}
        style={styles.dropdownItem}
        onPress={() => {
          Haptics.selectionAsync();
          if (type === 'category') {
            setCategory(item);
            setShowCategoryDropdown(false);
          } else if (type === 'unit') {
            setUnit(item);
            setShowUnitDropdown(false);
          } else if (type === 'payment') {
            if (paymentMethods.includes(item)) {
              setPaymentMethods(paymentMethods.filter(m => m !== item));
            } else {
              setPaymentMethods([...paymentMethods, item]);
            }
          }
        }}
      >
        <Text style={styles.dropdownItemText}>{item}</Text>
        {isSelected && <Check size={18} color="#ed3237" />}
      </TouchableOpacity>
    );
  };

  const handleAddAddon = () => {
    setAddons([...addons, { id: Date.now().toString(), name: "", price: "" }]);
  };

  const handleRemoveAddon = (id: string) => {
    setAddons(addons.filter(addon => addon.id !== id));
  };

  const handleAddonChange = (id: string, field: string, value: string) => {
    setAddons(addons.map(addon => 
      addon.id === id ? { ...addon, [field]: value } : addon
    ));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={["#e91e63", "#ff5252"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.header3DEffect} />
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
            style={styles.backButtonGradient}
          >
            <ChevronLeft color="#fff" size={24} />
          </LinearGradient>
        </TouchableOpacity>
        
        <Animated.Text style={[styles.headerTitle, { opacity: fadeAnim }]}>
          {service ? "Edit Service" : "Create New Service"}
        </Animated.Text>
        
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.formCard, 
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideUpAnim },
                { scale: cardScale }
              ] 
            }
          ]}
        >
          {/* Card Header */}
          <LinearGradient
            colors={["#ed3237", "#ff5f6d"]}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardHeaderText}>
              {service ? "Edit Your Service" : "Create New Service"}
            </Text>
          </LinearGradient>
          
          {/* Service Code */}
          <View style={styles.serviceCodeContainer}>
            <Text style={styles.serviceCodeLabel}>Service Code</Text>
            <View style={styles.serviceCodeValue}>
              <Text style={styles.serviceCodeText}>
                {serviceCode}
              </Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Service Information</Text>
          
          {/* Service Name */}
          <View style={[
            styles.inputContainer, 
            isFocused.serviceName && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputLabel}>Service Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Premium Gas Delivery"
              placeholderTextColor="#aaa"
              value={serviceName}
              onChangeText={setServiceName}
              
            />
          </View>
          
          {/* Description */}
          <View style={[
            styles.inputContainer, 
            isFocused.description && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
             style={[styles.input, styles.textArea]}
              placeholder="Describe your service in detail..."
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              // onFocus={() => handleFocus('description')}
              // onBlur={() => handleBlur('description')}
            />
          </View>
          
          {/* Category */}
          <Text style={styles.inputLabel}>Category</Text>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown('category')}
          >
            <Tag color="#ed3237" size={20} />
            <Text style={styles.dropdownText}>{category}</Text>
            {showCategoryDropdown ? 
              <ChevronUp size={18} color="#ed3237" /> : 
              <ChevronDown size={18} color="#ed3237" />
            }
          </TouchableOpacity>

          {showCategoryDropdown && (
            <Animated.View 
              style={[styles.dropdownContainer, { opacity: fadeAnim }]}
            >
              {categories.map(item => renderDropdownItem(item, 'category'))}
            </Animated.View>
          )}
          
          {/* Pricing & Time */}
          <View style={styles.row}>
            {/* Price */}
            <View style={[styles.halfInputContainer, { marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Price *</Text>
              <View style={styles.priceInputContainer}>
                <DollarSign color="#ed3237" size={20} style={styles.currencyIcon} />
                <TextInput
                  style={[styles.input, { paddingLeft: 38 }]}
                  placeholder="0.00"
                  placeholderTextColor="#aaa"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  onFocus={() => handleFocus('price')}
                  onBlur={() => handleBlur('price')}
                />
              </View>
            </View>
            
            {/* Estimated Time */}
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Estimated Time</Text>
              <View style={styles.timeInputContainer}>
                <Clock color="#ed3237" size={20} style={styles.currencyIcon} />
                <TextInput
                  style={[styles.input, { paddingLeft: 38 }]}
                  placeholder="30 mins"
                  placeholderTextColor="#aaa"
                  value={estimatedTime}
                  onChangeText={setEstimatedTime}
                
                />
              </View>
            </View>
          </View>
          
          {/* Unit & Discount */}
          <View style={styles.row}>
            {/* Unit */}
            <View style={[styles.halfInputContainer, { marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Unit</Text>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => toggleDropdown('unit')}
              >
                <Text style={styles.dropdownText}>{unit}</Text>
                {showUnitDropdown ? 
                  <ChevronUp size={18} color="#ed3237" /> : 
                  <ChevronDown size={18} color="#ed3237" />
                }
              </TouchableOpacity>

              {showUnitDropdown && (
                <Animated.View 
                  style={[styles.dropdownContainer, { 
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    opacity: fadeAnim 
                  }]}
                >
                  {unitOptions.map(item => renderDropdownItem(item, 'unit'))}
                </Animated.View>
              )}
            </View>
            
            {/* Discount */}
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={[styles.input, { paddingLeft: 15 }]}
                  placeholder="0"
                  placeholderTextColor="#aaa"
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  
                />
              </View>
            </View>
          </View>
          
          {/* Inventory Section */}
          <Text style={styles.sectionTitle}>Inventory & Availability</Text>
          
          {/* Availability */}
          <Text style={styles.inputLabel}>Availability</Text>
          <View style={styles.availabilityContainer}>
            {availabilityOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.availabilityOption,
                  availability === option && styles.availabilityOptionSelected
                ]}
                onPress={() => setAvailability(option)}
              >
                <Text style={[
                  styles.availabilityText,
                  availability === option && styles.availabilityTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Max Quantity */}
          <View style={[
            styles.inputContainer, 
            isFocused.maxQuantity && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputLabel}>Max Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Leave empty for unlimited"
              placeholderTextColor="#aaa"
              value={maxQuantity}
              onChangeText={setMaxQuantity}
              keyboardType="numeric"
           
            />
          </View>
          
          {/* Is Featured */}
          <View style={[styles.inputContainer, styles.switchContainer]}>
            <Text style={styles.inputLabel}>Feature this service?</Text>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: "#e0e0e0", true: "#ed3237" }}
              thumbColor="#fff"
            />
          </View>
          
          {/* Additional Information */}
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          {/* Tags */}
          <View style={[
            styles.inputContainer, 
            isFocused.tags && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputLabel}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="gas, delivery, emergency"
              placeholderTextColor="#aaa"
              value={tags}
              onChangeText={setTags}
            />
          </View>
          
          {/* Service Radius */}
          <View style={[
            styles.inputContainer, 
            isFocused.serviceRadius && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputLabel}>Service Radius</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5 km"
              placeholderTextColor="#aaa"
              value={serviceRadius}
              onChangeText={setServiceRadius}
      
            />
          </View>
           {/* <Text style={styles.sectionTitle}>Payment Method</Text> */}
          
          {/* Tags */}
          {/* <View style={[
            styles.inputContainer, 
            isFocused.tags && styles.inputContainerFocused
          ]}>
            <Text style={styles.inputLabel}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="gas, delivery, emergency"
              placeholderTextColor="#aaa"
              value={tags}
              onChangeText={setTags}
            />
          </View> */}
          {/* Payment Methods */}
          <PaymentMethodsActionSheet
            selectedMethods={paymentMethods}
            onSelectionChange={setPaymentMethods}
          />
          {/* Addons */}
          <Text style={styles.inputLabel}>Addons</Text>
          {addons.map((addon) => (
            <View key={addon.id} style={[styles.row, styles.addonContainer]}>
              <View style={styles.addonInput}>
                <TextInput
                  style={[styles.input, styles.addonName]}
                  placeholder="Addon name"
                  placeholderTextColor="#aaa"
                  value={addon.name}
                  onChangeText={(text) => handleAddonChange(addon.id, 'name', text)}
                />
              </View>
              <View style={styles.addonInput}>
                <TextInput
                  style={[styles.input, styles.addonPrice]}
                  placeholder="Price"
                  placeholderTextColor="#aaa"
                  value={addon.price}
                  onChangeText={(text) => handleAddonChange(addon.id, 'price', text)}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity 
                style={styles.removeAddonButton}
                onPress={() => handleRemoveAddon(addon.id)}
              >
                <X size={20} color="#ed3237" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addAddonButton}
            onPress={handleAddAddon}
          >
            <Text style={styles.addAddonText}>+ Add Addon</Text>
          </TouchableOpacity>
          
          {/* Additional Info */}
          <View style={styles.infoBox}>
            <Info size={18} color="#5e72e4" />
            <Text style={styles.infoText}>
              Services with complete information can get more engagement ! 
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleAddService}
              disabled={loading}
            >
              <LinearGradient
                colors={["#ed3237", "#ff5f6d"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.buttonContent}>
                  <Check color="#fff" size={20} />
                  <Text style={styles.buttonText}>
                    {loading
                      ? service
                        ? "Updating..."
                        : "Creating..."
                      : service
                      ? "Update Service"
                      : "Create Service"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
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
    shadowColor: "#d81b60",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    zIndex: 100,
  },
  header3DEffect: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    height: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    opacity: 0.7,
    zIndex: -1,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: width - 120,
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    elevation: 15,
    shadowColor: "#3f51b5",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    marginBottom: 20,
    zIndex: 50,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  serviceCodeContainer: {
    alignItems: 'center',
    marginTop: -15,
    marginBottom: 20,
    zIndex: 20,
  },
  serviceCodeLabel: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: -10,
    zIndex: 10,
  },
  serviceCodeValue: {
    backgroundColor: '#f8f9fe',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ed3237',
  },
  serviceCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ed3237',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginVertical: 15,
    marginHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 5,
  },
  inputContainerFocused: {
    borderColor: '#ed3237',
    backgroundColor: '#fff',
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1.01 }],
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
    marginLeft: 15,
    marginTop: 5,
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: 'transparent',
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    backgroundColor: "#f9f9f9",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  dropdownText: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#3f51b5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#444",
    fontWeight: '500',
  },
  row: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  halfInputContainer: {
    flex: 1,
  },
  priceInputContainer: {
    position: 'relative',
  },
  timeInputContainer: {
    position: 'relative',
  },
  currencyIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 10,
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  availabilityOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  availabilityOptionSelected: {
    backgroundColor: '#ed3237',
    borderColor: '#ed3237',
  },
  availabilityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  availabilityTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15,
  },
  addonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  addonInput: {
    flex: 1,
    marginRight: 10,
  },
  addonName: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
  },
  addonPrice: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
  },
  removeAddonButton: {
    padding: 10,
  },
  addAddonButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f5ff',
    borderRadius: 10,
    alignItems: 'center',
  },
  addAddonText: {
    color: '#5e72e4',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 25,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#5e72e4',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 25,
    gap: 15,
  },
  button: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#ed3237",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ed3237',
  },
  submitButton: {
    backgroundColor: '#ed3237',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButtonText: {
    color: "#ed3237",
    textAlign: 'center',
    paddingVertical: 16,
  },
});