import { Stack } from "expo-router";
export default ()=>{
    return(
        <Stack>
            <Stack.Screen name="updateprofile" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="HowToUse" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="PrivacyPolicy" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="security" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="about" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="trermofuse" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="contactsupport" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="Edrawer" options={{ headerShown: false ,animation:'slide_from_right'}} />


        </Stack>
    )
}