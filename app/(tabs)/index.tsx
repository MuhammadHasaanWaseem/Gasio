import { useAuth } from '@/context/authcontext'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
export default ()=> {
const {logout}=useAuth()
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor:'white'}} >
      <Text className='text-2xl font-bold'>index</Text>
 <TouchableOpacity onPress={logout} style={{
  backgroundColor:' #ed3237',
  padding: 10,
  borderRadius: 5,
  marginTop: 20,     
 }}>
  <Text>
    logout
  </Text>
 </TouchableOpacity>
    </View>
  )
}