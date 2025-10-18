import { Stack } from "expo-router";

export default ()=>{
    return(
        <Stack initialRouteName="login" screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }}>
            <Stack.Screen name="registerasuser" options={{ headerShown: false }} />
            <Stack.Screen name="registerasvendor" options={{ headerShown: false }} />
            <Stack.Screen name="loginasvendor" options={{ headerShown: false }} />
            <Stack.Screen name="otpverification" options={{ headerShown: false }} />
            <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
            <Stack.Screen name="createUserProfile" options={{ headerShown: false }} />
            <Stack.Screen name="createVendorProfile" options={{ headerShown: false }} />
        </Stack>
    )
}
