import Dashboard from "@/screens/(Vendor)/Dashboard"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default ()=>{
    const insets = useSafeAreaInsets()
    return(
          <Dashboard/>
    )
}