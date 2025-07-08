import MapModal from '@/components/MapModal';
import countries from '@/constants/country';
import { useVendor } from '@/context/vendorcontext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ChevronLeft, SearchIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
export default ()=>{
  const router = useRouter();
  const { vendor, vendorBusiness, refreshVendorProfile } = useVendor();
  const [modalVisible, setModalVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [website, setwebsite] = useState('');
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
    if (vendor) {
      setFullName(vendor.full_name || '');
      setEmail(vendor.email || '');
      setPhone(vendor.phone ? vendor.phone.replace(/^[^\d]+/, '') : '');
      setCnic(vendor.cnic || '');
      if (vendor.country_code) {
        const match = countries.find(c => c.code === vendor.country_code);
        if (match) setSelectedCountry(match);
      }
    }
    if (vendorBusiness) {
      setBusinessName(vendorBusiness.business_name || '');
      setBusinessLicense(vendorBusiness.business_license || '');
      setAddress(vendorBusiness.address || '');
    }
    if (vendor?.profile_picture_url) {
      setAvatar(vendor.profile_picture_url);
    }
  }, [vendor, vendorBusiness]);

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

  const uploadBusinessLogo = async (userId: string) => {
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

      const businessLogoUrl = await uploadBusinessLogo(userId);
      if (!businessLogoUrl) {
        Alert.alert('Upload Error', 'Failed to upload image');
        setLoading(false);
        return;
      }

      const { error: ownerError } = await supabase.from('vendor_owners').upsert({
        id: userId,
        full_name: fullName,
        phone: `${phone}`,
        email,
        cnic,
        profile_picture_url: businessLogoUrl,
        country_code: selectedCountry.dial_code,
      });
      if (ownerError) throw new Error(ownerError.message);

      const { error: vendorError } = await supabase.from('vendors').upsert({
        owner_id: userId,
        business_name: businessName,
        business_license: businessLicense,
        business_logo_url: businessLogoUrl,
        address,
        latitude: selectedCoords?.latitude ?? null,
        longitude: selectedCoords?.longitude ?? null,
        website
      }, { onConflict: 'owner_id' });
      if (vendorError) throw new Error(vendorError.message);

      await refreshVendorProfile();
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
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={["#ed3237", "#ff5f6d"]} style={styles.headerBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {vendor?.profile_picture_url ? (
          <Image source={{ uri: `${vendor?.profile_picture_url}?t=${Date.now()}` }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarPlaceholder}>Tap to select business logo</Text>
        )}
      </TouchableOpacity>

      <TextInput placeholder="Full Name" placeholderTextColor="grey" value={fullName} onChangeText={setFullName} style={styles.input} />

      <View style={styles.phoneRow}>
        <TouchableOpacity onPress={() => setShowCountryList(true)} style={styles.countrySelector}>
          <Text style={styles.countryText}>{selectedCountry.flag} {selectedCountry.dial_code}</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Phone"
          placeholderTextColor="grey"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            validatePhone(text);
          }}
          keyboardType="phone-pad"
          style={styles.phoneInput}
        />
        {phoneError ? <Text style={{ color: 'red', marginBottom: 10 }}>{phoneError}</Text> : null}
      </View>

      <TextInput placeholder="Email" placeholderTextColor="grey" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="CNIC (13 digits)" placeholderTextColor="grey" value={cnic} onChangeText={(text) => {
        setCnic(text);
        validateCnic(text);
      }} keyboardType="numeric" style={styles.input} />
      {cnicError ? <Text style={{ color: 'red', marginBottom: 10 }}>{cnicError}</Text> : null}
      <TextInput placeholder="Business Name" placeholderTextColor="grey" value={businessName} onChangeText={setBusinessName} style={styles.input} />
      <TextInput placeholder="Business License" placeholderTextColor="grey" value={businessLicense} onChangeText={setBusinessLicense} style={styles.input} />
      {/* <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} /> */}
      <View>
  <TextInput
    placeholder="Address"
    placeholderTextColor="grey"
    value={address}
    onChangeText={setAddress}
    style={[styles.input, { paddingRight: 80 }]}
    editable={false}
  />
  <TouchableOpacity style={[styles.locationIcon, { right: 15 }]} onPress={handleUseCurrentLocation}>
    <Ionicons name="location-outline" size={24} color="gray" />
  </TouchableOpacity>
  <TouchableOpacity style={[styles.locationIcon, { right: 50 }]} onPress={() => setModalMapVisible(true)}>
    <Ionicons name="map-outline" size={24} color="gray" />
  </TouchableOpacity>
</View>

      <TextInput
        placeholder="Website (optional)"
        placeholderTextColor="grey"
        value={website}
        onChangeText={setwebsite}
        keyboardType="url"
        style={styles.input}
      />

      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
        <TouchableOpacity
          onPress={handleSaveProfile}
          style={styles.button}
          disabled={loading || phoneError !== '' || cnicError !== ''}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Profile updated successfully!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.back();
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCountryList} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 12,
              marginHorizontal: 5,
              marginTop: 3,
              marginBottom: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              elevation: 2,
              backgroundColor: '#fff'

            }}
          >
            <SearchIcon color="#ed3237" size={20} />
            <TextInput
              placeholder="Search country..."
              placeholderTextColor="grey"
              value={countrySearch}
              onChangeText={setCountrySearch}
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 16,
                color: '#333',
              }}
            />
            <TouchableOpacity onPress={() => setShowCountryList(false)}>
              <X color="#ed3237" size={22} />
            </TouchableOpacity>
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
                <Text style={styles.countryItemText}>{item.flag} {item.name} ({item.dial_code})</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
      <MapModal
  visible={modalMapVisible}
  onClose={() => setModalMapVisible(false)}
  onLocationSelect={handleLocationSelect}
/>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  locationIcon: {
  position: 'absolute',
  top: 15,
},

  container: { backgroundColor: '#fff', flex: 1, marginTop: 20 },
  headerBackground: { paddingBottom: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 15 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  avatarContainer: { marginTop: 20, alignSelf: 'center', marginBottom: 20, width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  avatarPlaceholder: { color: '#999', textAlign: 'center', paddingHorizontal: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  input: { borderWidth: 1, borderColor: '#ccc', color:'black',borderRadius: 8, padding: 12, marginBottom: 15 },
  searchinput: { alignItems: 'center',color:'black', borderRadius: 8, padding: 12, marginBottom: 15 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', marginBottom: 15 },
  countrySelector: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f0f0f0' },
  countryText: { color:'black',fontSize: 16 },
  phoneInput: { color:'black',flex: 1, padding: 10, fontSize: 16 },
  button: { backgroundColor: '#ed3237', padding: 15, width: '60%', borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalText: { fontSize: 18, marginBottom: 20 },
  modalButton: { backgroundColor: '#ed3237', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10 },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  countryItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  countryItemText: { fontSize: 16 },
});
