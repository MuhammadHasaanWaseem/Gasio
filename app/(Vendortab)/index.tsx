import { useAuth } from '@/context/authcontext'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
export default ()=> {
  const { logout } = useAuth()
  return (
    <View className='flex-1 bg-white' style={{backgroundColor:'#fff',flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text className='text-2xl font-bold'>index</Text>
      <Pressable onPress={logout}>
        <Text style={{backgroundColor:'#ed3237',padding:10,borderRadius:5,marginTop:20}}>
          logout
        </Text> 
      </Pressable>
    </View>
  )
}