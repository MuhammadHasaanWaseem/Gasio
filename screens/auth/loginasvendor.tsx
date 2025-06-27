import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      // Navigate to tabs after successful login
      router.push('/(tabs)'); // Adjust path to your tabs route
    }
  };

  const handleSignupNavigation = () => {
    router.push('/(auth)/registerasvendor'); // Navigate to signup screen
  };

  const handleForgotPasswordNavigation = () => {
    router.push('/forgotpassword'); // Navigate to forgot password screen
  };

  return (
    <View style={styles.container}>
      <Image
      source={require('../../assets/images/img.png')}
      style={{ width: 300, height: 300 ,margin:20}}
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
      <TouchableOpacity onPress={handleForgotPasswordNavigation}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignupNavigation}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 
        <ActivityIndicator size="small" color="#fff" />
        : 'Login'}</Text>
      </TouchableOpacity>
      
      <View style={{
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 20,
}}>
  <View style={{
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  }} />
  
  <Text style={{
    marginHorizontal: 10,
    fontWeight: '500',
    color: '#555',
  }}>
    or
  </Text>

  <View style={{
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  }} />
</View>

      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.linkText} >
          Login as Customer
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  linkText: {
    color: '#ed3237',
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#ed3237',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


