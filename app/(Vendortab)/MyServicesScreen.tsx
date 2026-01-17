import MyServicesScreen from "@/screens/(Vendor)/MyServicesScreen"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default ()=>{
    const insets = useSafeAreaInsets()
    return(
           <MyServicesScreen/>
    )
}