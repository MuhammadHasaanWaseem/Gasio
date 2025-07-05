import { Stack } from "expo-router";
export default ()=>{
    return(
        <Stack>
            <Stack.Screen name="category" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="searchnearby" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="topservices" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="topvendors" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="Eservice" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="vendor" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="sharedchatlist" options={{ headerShown: false ,animation:'slide_from_right'}} />
            <Stack.Screen name="chat" options={{ headerShown: false ,animation:'slide_from_right'}} />

        </Stack>
    )
}