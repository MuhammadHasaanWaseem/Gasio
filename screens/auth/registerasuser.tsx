import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

import { useAuth } from '../../context/authcontext';

const AuthFlow = () => {
  const router = useRouter();
  const { loginAsUser } = useAuth();
  const [screen, setScreen] = useState<'register' | 'otp'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [eye, seteye] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
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

      // loginAsUser();
      router.push('/createUserProfile');
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
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!eye}
              style={styles.inputPassword}
            />
            <Pressable onPress={() => seteye(!eye)} style={styles.eyeButton}>
              {eye ? <Eye color={'#ed3237'} /> : <EyeOff color={'#ed3237'} />}
            </Pressable>
          </View>
          <TouchableOpacity onPress={handleRegister} style={styles.button} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register as User</Text>}
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
            style={styles.optinput}
            maxLength={6}
          />
          <TouchableOpacity onPress={handleVerifyOtp} style={styles.buttontwo} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
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
  optinput: {
    borderWidth: 1,
    borderColor: '#ed3237',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    width: '50%',
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
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ed3237',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  eyeButton: {
    paddingHorizontal: 10,
  },
});

export default AuthFlow;
