import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default () => {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
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
    const response = await fetch(avatar);
    const blob = await response.blob();
    const filePath = `${userId}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, { upsert: true });
    if (uploadError) {
      Alert.alert('Upload Error', uploadError.message);
      return null;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      if (!userId) {
        Alert.alert('Error', 'User not found');
        setLoading(false);
        return;
      }
      const avatarUrl = await uploadAvatar(userId);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: avatarUrl,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        })
        .eq('id', userId);
      if (error) {
        Alert.alert('Update Error', error.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/(tabs)'); // Navigate to main app tabs
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
      setLoading(false);
    }
  };

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
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleSaveProfile} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarContainer: {
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
});
