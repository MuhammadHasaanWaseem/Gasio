import MapModal from '@/components/MapModal';
import countries from '@/constants/country';
import { useUser } from '@/context/usercontext';
import {
  findCountryByStoredCode,
  splitE164ToLocal,
  toE164Phone,
} from '@/helper/phoneCountry';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Camera, CheckCircle, ChevronLeft, CreditCard, MapPin, Phone, SearchIcon, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import styles from './updateprofile.styles';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
export default () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUserProfile } = useUser();
  const defaultCountry = countries.find((c) => c.code === 'PK') ?? countries[0];
  const [modalVisible, setModalVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [showCountryList, setShowCountryList] = useState(false);
  const [cnic, setCnic] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [modalMapVisible, setModalMapVisible] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const handleLocationSelect = async (location: { latitude: number; longitude: number }) => {
    setSelectedCoords(location);
    setModalMapVisible(false);

    try {
      const [reverseGeocode] = await Location.reverseGeocodeAsync(location);
      if (reverseGeocode) {
        const formattedAddress = `${reverseGeocode.name ? reverseGeocode.name + ', ' : ''}${reverseGeocode.street ? reverseGeocode.street + ', ' : ''}${reverseGeocode.city ? reverseGeocode.city + ', ' : ''}${reverseGeocode.region ? reverseGeocode.region + ', ' : ''}${reverseGeocode.postalCode ? reverseGeocode.postalCode + ', ' : ''}${reverseGeocode.country ? reverseGeocode.country : ''}`;
        setAddress(formattedAddress.trim().replace(/,\s*$/, ''));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get address from location');
    }
  };

  const handleUseCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    await handleLocationSelect({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      const storedCountry = findCountryByStoredCode(countries, user.country_code);
      const resolvedCountry = storedCountry ?? defaultCountry;
      if (storedCountry) setSelectedCountry(storedCountry);
      setPhone(splitE164ToLocal(user.phone, resolvedCountry));
      setCnic(user.cnic || '');
    }

    if (user?.avatar_url) {
      setAvatar(user.avatar_url);
    }
  }, [user]);

  const filteredCountries = countries.filter(item =>
    item.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    item.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    item.dial_code.includes(countrySearch)
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Camera roll permission is required.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!pickerResult.canceled) {
      setAvatar(pickerResult.assets[0].uri);
    }
  };

  const uploaduserlogo = async (userId: string) => {
    if (!avatar || avatar.startsWith('https')) return avatar;

    try {
      const fileExt = avatar.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `${userId}/avatar.${fileExt}`;
      const fileType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      // Read the file URI
      const fileUri = avatar;

      // Prepare file info
      const file = {
        uri: fileUri,
        name: fileName,
        type: fileType,
      };

      // Use FormData for upload
      const formData = new FormData();
      formData.append('file', file as any);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file as any, {
          contentType: fileType,
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error.message);
        return null;
      }

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return publicData.publicUrl;
    } catch (err: any) {
      console.error('Unexpected upload error', err.message);
      return null;
    }
  };


  const validateFields = () => {
    const phoneRegex = /^[0-9]{10,15}$/;
    const cnicRegex = /^[0-9]{13}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Invalid Phone', 'Phone number must be 10–15 digits');
      return false;
    }
    if (!cnicRegex.test(cnic)) {
      Alert.alert('Invalid CNIC', 'CNIC must be exactly 13 digits');
      return false;
    }
    return true;
  };

  // New validation states
  const [phoneError, setPhoneError] = React.useState('');
  const [cnicError, setCnicError] = React.useState('');

  // Validation functions
  const validatePhone = (value: string) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError('Phone number must be 10–15 digits');
    } else {
      setPhoneError('');
    }
  };

  const validateCnic = (value: string) => {
    const cnicRegex = /^[0-9]{13}$/;
    if (!cnicRegex.test(value)) {
      setCnicError('CNIC must be exactly 13 digits');
    } else {
      setCnicError('');
    }
  };

  const handleSaveProfile = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId || userError) {
        Alert.alert('Error', 'User not found');
        setLoading(false);
        return;
      }

      const uploadedAvatarUrl = await uploaduserlogo(userId);
      const avatarUrl = uploadedAvatarUrl ?? user?.avatar_url ?? null;

      const { error } = await supabase.from('user_profiles').upsert({
        id: userId,
        full_name: fullName,
        phone: toE164Phone(phone, selectedCountry),
        cnic,
        country_code: selectedCountry.code,
        avatar_url: avatarUrl,
        address,
        latitude: selectedCoords?.latitude ?? null,
        longitude: selectedCoords?.longitude ?? null,
      });
      if (error) throw new Error(error.message);

      await refreshUserProfile();
      setTimeout(() => {
        setLoading(false);
        setModalVisible(true);
      }, 500);
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#e91e63", "#ff5252"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#fff" size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#e91e63" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <LinearGradient
                colors={["#e91e63", "#ff5252"]}
                style={styles.cameraIconGradient}
              >
                <Camera size={18} color="#fff" />
              </LinearGradient>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Profile Picture</Text>
          <Text style={styles.avatarSubLabel}>Tap to change</Text>
        </Animated.View>

        {/* Personal Information Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <User size={20} color="#e91e63" />
            </View>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
          </View>

          <View style={styles.phoneContainer}>
            <View style={styles.inputIconContainer}>
              <Phone size={20} color="#e91e63" />
            </View>
            <TouchableOpacity
              onPress={() => setShowCountryList(true)}
              style={styles.countrySelector}
            >
              <Text style={styles.countryText}>
                {selectedCountry.flag} {selectedCountry.dial_code}
              </Text>
            </TouchableOpacity>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                validatePhone(text);
              }}
              keyboardType="phone-pad"
              style={styles.phoneInput}
            />
          </View>
          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}

          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <CreditCard size={20} color="#e91e63" />
            </View>
            <TextInput
              placeholder="CNIC (13 digits)"
              placeholderTextColor="#999"
              value={cnic}
              onChangeText={(text) => {
                setCnic(text);
                validateCnic(text);
              }}
              keyboardType="numeric"
              maxLength={13}
              style={styles.input}
            />
          </View>
          {cnicError ? (
            <Text style={styles.errorText}>{cnicError}</Text>
          ) : null}
        </Animated.View>

        {/* Location Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          <View style={styles.locationContainer}>
            <View style={styles.inputIconContainer}>
              <MapPin size={20} color="#e91e63" />
            </View>
            <TextInput
              placeholder="Your Address"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              style={[styles.input, styles.addressInput]}
              editable={false}
              multiline
            />
          </View>

          <View style={styles.locationButtonsRow}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="location" size={20} color="#e91e63" />
              <Text style={styles.locationButtonText}>Current Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setModalMapVisible(true)}
            >
              <Ionicons name="map" size={20} color="#e91e63" />
              <Text style={styles.locationButtonText}>Choose on Map</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSaveProfile}
            style={styles.saveButtonWrapper}
            disabled={loading || phoneError !== '' || cnicError !== ''}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading || phoneError !== '' || cnicError !== ''
                ? ["#ccc", "#999"]
                : ["#e91e63", "#ff5252"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={60} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalText}>Your profile has been updated successfully</Text>
            <TouchableOpacity
              style={styles.modalButtonWrapper}
              onPress={() => {
                setModalVisible(false);
                router.back();
              }}
            >
              <LinearGradient
                colors={["#e91e63", "#ff5252"]}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Country Selector Modal */}
      <Modal visible={showCountryList} animationType="slide">
        <View style={styles.countryModalContainer}>
          <LinearGradient
            colors={["#e91e63", "#ff5252"]}
            style={[styles.countryModalHeader, { paddingTop: insets.top }]}
          >
            <Text style={styles.countryModalTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={() => setShowCountryList(false)}
              style={styles.closeButton}
            >
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.searchContainer}>
            <SearchIcon color="#e91e63" size={20} />
            <TextInput
              placeholder="Search country..."
              placeholderTextColor="#999"
              value={countrySearch}
              onChangeText={setCountrySearch}
              style={styles.searchInput}
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCountry(item);
                  setShowCountryList(false);
                  setCountrySearch('');
                }}
                style={styles.countryItem}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCode}>{item.dial_code}</Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>

      <MapModal
        visible={modalMapVisible}
        onClose={() => setModalMapVisible(false)}
        onLocationSelect={handleLocationSelect}
      />
    </View>
  );
}

/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa'
  },
  headerBackground: {
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 10,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e91e63',
    borderStyle: 'dashed',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    elevation: 10,
  },
  cameraIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  avatarSubLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#fce4ec',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  inputIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fce4ec',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  countrySelector: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  countryText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  errorText: {
    color: '#f44336',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  locationButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fce4ec',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  locationButtonText: {
    color: '#e91e63',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 25,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtonWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  countryModalContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  countryModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  countryModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 15,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  countryCode: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  locationIcon: {
    position: 'absolute',
    top: 15,
  },
}); */
