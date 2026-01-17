import VendorOrdersScreen from "@/screens/(Vendor)/VendorOrdersScreen"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default ()=>{
    const insets = useSafeAreaInsets()
    return(
       <View style={{ flex: 1,backgroundColor:'white', paddingTop: insets.top }}>
          <VendorOrdersScreen/>
       </View>
    )
}