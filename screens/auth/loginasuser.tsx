import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native'; // Ensure you have lucide-react-native installed
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/authcontext';
import { useUser } from '../../context/usercontext';
import { supabase } from '../../lib/supabase';


const Loginasuser = () => {

  

  const router = useRouter();
  const { loginAsUser } = useAuth();
  const { refreshUserProfile } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showpass,setshowpass]=useState(false);
  const handleLogin = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      loginAsUser();
      console.log('Calling refreshUserProfile after login');
      await refreshUserProfile();
      console.log('Completed refreshUserProfile after login');
      // Navigate to tabs after successful login
      router.push('/(tabs)'); // Adjust path to your tabs route
    }
  }, [email, password, loginAsUser, refreshUserProfile, router]);

  const handleSignupNavigation = useCallback(() => {
    router.push('/registerasuser'); // Navigate to signup screen
  }, [router]);

  const handleForgotPasswordNavigation = useCallback(() => {
    router.push('/forgotpassword'); // Navigate to forgot password screen
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
      source={require('../../assets/images/Gasio.png')}
      style={{ width: 400, height: 200, marginBottom: 20 }}
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
          secureTextEntry={!showpass}
          style={[styles.input, { borderWidth: 0, flex: 1, marginBottom: 0 }]}
        />
        <Pressable onPress={() => setshowpass(!showpass)} style={{ paddingHorizontal: 10 }}>
        {
          showpass ? <Eye color={'#ed3237'}/> : <EyeOff color={'#ed3237'}/>
        }
        </Pressable>
      </View>
      <TouchableOpacity onPress={handleForgotPasswordNavigation}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity 
      onPress={handleSignupNavigation}>
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

      <Pressable onPress={() => router.push('/loginasvendor')}>
        <Text style={styles.linkText} >
          Login as Vendor
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

export default Loginasuser;
