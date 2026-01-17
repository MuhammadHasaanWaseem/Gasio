import Orders from "@/screens/(Customer)/Orders"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default ()=>{
    const insets = useSafeAreaInsets()
    return(
      <View style={{ flex: 1, paddingTop: insets.top }}>
         <Orders/>
      </View>
    )
}