import { Stack } from "expo-router";
export default ()=>{
    return(
        <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="registerasuser" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="registerasvendor" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="loginasvendor" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="otpverification" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="forgotpassword" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="createUserProfile" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="createVendorProfile" options={{ headerShown: false ,animation:'slide_from_right'}} />
        </Stack>
    )
}