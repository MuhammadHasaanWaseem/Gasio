import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/authcontext';
import { supabase } from '../../lib/supabase';

export default () => {
  const router = useRouter();
  const { loginAsVendor } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [eye, seteye] = useState(false);

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
      await loginAsVendor();

      // Check if vendor profile exists
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const { data: vendorProfile, error: profileError } = await supabase
        .from('vendor_owners')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !vendorProfile) {
        // Navigate to create vendor profile if profile does not exist
        router.push('/createVendorProfile');
      } else {
        // Navigate to vendor tabs if profile exists
        router.push('/(Vendortab)');
      }
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
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10 }}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!eye}
          style={[styles.input, { borderWidth: 0, flex: 1, marginBottom: 0 }]}
        />
        <Pressable onPress={() => seteye(!eye)} style={{ paddingHorizontal: 10 }}>
          {eye ? <Eye color={'#ed3237'}/> : <EyeOff color={'#ed3237'}/>}
        </Pressable>
      </View>
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
