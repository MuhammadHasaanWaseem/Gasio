import { Image, View } from "react-native"

export default ()=>{

    return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff'}}>
        <Image source={require('../../assets/splahicon/splash.gif')} style={{width:200,height:200}} />

    </View>
    )
}