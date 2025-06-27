// Complete Auth Flow with OTP Verification using Supabase

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const AuthFlow = () => {
  const router = useRouter();
  const [screen, setScreen] = useState<'register' | 'otp'>('register');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      const newUserId = data.user?.id;
      if (!newUserId) throw new Error('User ID not found');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: newUserId,
            full_name: fullName,
            phone,
            address,
          },
        ]);

      if (profileError) throw profileError;

      setScreen('otp');
    } catch (err:any) {
      Alert.alert('Registration Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      Alert.alert('Error', 'Please enter both email and OTP.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;

      router.push('/(auth)/createUserProfile');
    } catch (err:any) {
      Alert.alert('OTP Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) {
      Alert.alert('Resend Failed', error.message);
    } else {
      Alert.alert('OTP Resent', 'Please check your email for the new OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/Gasio.png')}
        style={styles.image}
      />

      {screen === 'register' && (
        <>
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity onPress={handleRegister} style={styles.button} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register as User</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {screen === 'otp' && (
        <View style={styles.waitingContainer}>
          <Text style={styles.text}>Enter OTP sent to your email</Text>
          <TextInput
            placeholder="OTP Code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            style={styles.input}
            maxLength={6}
          />
          <TouchableOpacity onPress={handleVerifyOtp} style={styles.buttontwo} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={resendOtp}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '80%',
    height: 400,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ed3237',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#ed3237',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
   buttontwo: {
    backgroundColor: '#ed3237',
    paddingVertical: 16,
    borderRadius: 30,
    width: '50%',
    textAlign: 'center',
    alignItems: 'center',
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  text: {
    marginBottom: 25,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#444',
  },
  waitingContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: '#ed3237',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AuthFlow;