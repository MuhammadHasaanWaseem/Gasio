import Search from "@/screens/(Customer)/search"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default ()=>{
    const insets = useSafeAreaInsets()
    return(
       <View style={{ flex: 1, paddingTop: insets.top }}>
          <Search/>
       </View>
    )
}