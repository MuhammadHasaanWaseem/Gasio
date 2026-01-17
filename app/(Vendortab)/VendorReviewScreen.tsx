import VendorReviewScreen from "@/screens/(Vendor)/VendorReviewScreen"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default ()=>{
    const insets = useSafeAreaInsets()
    return(
       <View style={{ flex: 1,backgroundColor:'white', paddingTop: insets.top }}>
          <VendorReviewScreen/>
       </View>
    )
}