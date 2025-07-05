import MapModal from '@/components/MapModal';
import countries from '@/constants/country';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/authcontext';
import { useUser } from '../../context/usercontext';
import { supabase } from '../../lib/supabase';
export default () => {
  const router = useRouter();
  const { loginAsUser } = useAuth();
  const { refreshUserProfile } = useUser();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cnic, setCnic] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const handleLocationSelect = async (location: { latitude: number; longitude: number }) => {
  setSelectedCoords(location);
  setModalVisible(false);

  try {
    const [reverseGeocode] = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    if (reverseGeocode) {
      const formattedAddress = `${reverseGeocode.name ? reverseGeocode.name + ', ' : ''}${reverseGeocode.street ? reverseGeocode.street + ', ' : ''}${reverseGeocode.city ? reverseGeocode.city + ', ' : ''}${reverseGeocode.region ? reverseGeocode.region + ', ' : ''}${reverseGeocode.postalCode ? reverseGeocode.postalCode + ', ' : ''}${reverseGeocode.country ? reverseGeocode.country : ''}`;
      setAddress(formattedAddress.trim().replace(/,\s*$/, ''));
    } else {
      setAddress('');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to get address from location');
    setAddress('');
  }
};

const handleUseCurrentLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission denied', 'Location permission is required to get your current location.');
    return;
  }
  let location = await Location.getCurrentPositionAsync({});
  const coords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
  await handleLocationSelect(coords);
};
  useEffect(() => {
    loginAsUser();
  }, []);

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

  const uploadAvatar = async (userId: string) => {
    if (!avatar) return null;

    try {
      const fileExt = avatar.split('.').pop();
      const fileName = `${userId.trim()}/avatar.${fileExt}`;
      const fileType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(
          fileName,
          {
            uri: avatar,
            name: fileName,
            type: fileType,
          } as any,
          {
            cacheControl: '3600',
            upsert: true,
            contentType: fileType,
          }
        );

      if (uploadError) {
        Alert.alert('Upload Error', uploadError.message);
        console.error('Upload Error:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data?.publicUrl || null;
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Unknown error');
      console.error(err);
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId || userError) {
        Alert.alert('Error', 'User not found');
        setLoading(false);
        return;
      }

      const avatarUrl = await uploadAvatar(userId);

      const { error } = await supabase.from('user_profiles').upsert({
        id: userId,
        full_name: fullName,
        phone: `${phone}`,
        address,
        avatar_url: avatarUrl,
        cnic,
        country_code: selectedCountry.dial_code,
        latitude: selectedCoords?.latitude ?? null,
        longitude: selectedCoords?.longitude ?? null,
      });

      if (error) {
        Alert.alert('Update Error', error.message);
        setLoading(false);
        return;
      }
      loginAsUser()
      await refreshUserProfile();
      setLoading(false);
      router.push('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unexpected error');
      console.error(err);
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter((item) =>
    item.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    item.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    item.dial_code.includes(countrySearch)
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarPlaceholder}>Tap to select avatar</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={() => setShowCountryList(!showCountryList)}
        style={styles.countryPicker}
      >
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
      <TextInput
        placeholder="CNIC (13 digits)"
        value={cnic}
        onChangeText={setCnic}
        keyboardType="numeric"
        style={styles.input}
      />
      {/* <TextInput
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      /> */}
  <View>
  <TextInput
    placeholder="Address"
    value={address}
    onChangeText={setAddress}
    style={[styles.input, { paddingRight: 40 }]}
    editable={false}
  />
  <TouchableOpacity style={styles.locationIcon} onPress={handleUseCurrentLocation}>
    <Ionicons name="location-outline" size={24} color="gray" />
  </TouchableOpacity>
  <TouchableOpacity style={[styles.locationIcon, { right: 50 }]} onPress={() => setModalVisible(true)}>
    <Ionicons name="map-outline" size={24} color="gray" />
  </TouchableOpacity>
</View>
      <TouchableOpacity
        onPress={handleSaveProfile}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Profile</Text>
        )}
      </TouchableOpacity>
      <MapModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onLocationSelect={handleLocationSelect}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  locationIcon: {
  position: 'absolute',
  right: 15,
  top: 15,
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
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 5,
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
    marginBottom: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
});
