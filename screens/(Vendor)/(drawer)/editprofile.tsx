import countries from '@/constants/country';
import { useVendor } from '@/context/vendorcontext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
export default function EditProfile() {
  const router = useRouter();
  const { vendor, vendorBusiness } = useVendor();
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

  useEffect(() => {
    if (vendor) {
      setFullName(vendor.full_name || '');
      setEmail(vendor.email || '');
      setPhone(vendor.phone ? vendor.phone.replace(/^\+\d+/, '') : '');
      setCnic(vendor.cnic || '');
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

  const filteredCountries = countries.filter((item) =>
    item.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    item.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    item.dial_code.includes(countrySearch)
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
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
    if (!avatar) return null;

    try {
      const fileExt = avatar.split('.').pop();
      const fileName = `${userId.trim()}/business_logo.${fileExt}`;
      const fileType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, {
          uri: avatar,
          name: fileName,
          type: fileType,
        } as any, {
          cacheControl: '3600',
          upsert: true,
          contentType: fileType,
        });

      if (uploadError) {
        Alert.alert('Upload Error', uploadError.message);
        console.error('Upload Error:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Unknown upload error');
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

  const handleSaveProfile = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      console.log("Starting save profile process");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("User data fetched:", userData, "Error:", userError);
      const userId = userData?.user?.id;

      if (!userId || userError) {
        Alert.alert('Error', 'User not found');
        setLoading(false);
        return;
      }

      console.log("Uploading business logo...");
      const businessLogoUrl = await uploadBusinessLogo(userId);
      console.log("Business logo URL:", businessLogoUrl);

      if (businessLogoUrl === null) {
        Alert.alert('Upload Error', 'Failed to upload business logo');
        setLoading(false);
        return;
      }

      console.log("Upserting vendor owner data...");
      const { error: ownerError } = await supabase.from('vendor_owners').upsert({
        id: userId,
        full_name: fullName,
        phone: `${selectedCountry.dial_code}${phone}`,
        email,
        cnic,
        profile_picture_url: businessLogoUrl,
        country_code: selectedCountry.code,
      });
      console.log("Vendor owner upsert error:", ownerError);

      if (ownerError) {
        Alert.alert('Vendor Owner Error', ownerError.message);
        setLoading(false);
        return;
      }

      console.log("Upserting vendor business data...");
      const { error: vendorError } = await supabase.from('vendors').upsert({
        owner_id: userId,
        business_name: businessName,
        business_license: businessLicense,
        business_logo_url: businessLogoUrl,
        address,
      });
      console.log("Vendor business upsert error:", vendorError);

      if (vendorError) {
        Alert.alert('Vendor Info Error', vendorError.message);
        setLoading(false);
        return;
      }

      console.log("Profile saved successfully");
      setLoading(false);
      router.back();
    } catch (err: any) {
      console.error("Error in saveProfile:", err);
      Alert.alert('Error', err.message || 'Unexpected error');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ed3237", "#ff5f6d"]}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 28 }} /> 
          {/* Placeholder for alignment */}
        </View>
      </LinearGradient>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarPlaceholder}>Tap to select business logo</Text>
        )}
      </TouchableOpacity>

      <TextInput placeholder="Full Name" value={fullName} onChangeText={setFullName} style={styles.input} />

      <TouchableOpacity onPress={() => setShowCountryList(!showCountryList)} style={styles.countryPicker}>
        <Text>{`${selectedCountry.flag} ${selectedCountry.name} (${selectedCountry.dial_code})`}</Text>
      </TouchableOpacity>

      {showCountryList && (
        <View style={styles.countryListContainer}>
          <TextInput
            placeholder="Search country"
            value={countrySearch}
            onChangeText={setCountrySearch}
            style={styles.searchInput}
          />
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
                <Text>{`${item.flag} ${item.name} (${item.dial_code})`}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <TextInput
        placeholder="Phone (without country code)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="CNIC (13 digits)" value={cnic} onChangeText={setCnic} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Business Name" value={businessName} onChangeText={setBusinessName} style={styles.input} />
      <TextInput placeholder="Business License" value={businessLicense} onChangeText={setBusinessLicense} style={styles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />

      <TouchableOpacity onPress={handleSaveProfile} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile</Text>}
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  headerBackground: {
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  avatarContainer: {
    marginTop: '15%',
    alignSelf: 'center',
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#ed3237',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  countryPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  countryListContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  countryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    margin: 10,
    backgroundColor: '#f9f9f9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#ed3237',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
