import { useAuth } from "@/context/authcontext";
import { useUser } from "@/context/usercontext";
import { useVendor } from "@/context/vendorcontext";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default () => {
  const { user, loading } = useUser();
  const { logout } = useAuth();
  const {vendor}=useVendor();
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity onPress={logout}>
          <Text style={{ color: "red" }}>Logout</Text>
        </TouchableOpacity>
        <Text>No user profile found. Please check your account setup. </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
              <TouchableOpacity onPress={logout}>
                <Text style={{ color: "red" }}>Logout</Text>
              </TouchableOpacity> 
      <Text style={{ color: "black" }}>{user.full_name} </Text>
      {user?.avatar_url ? (
        <Image
          source={{ uri: user.avatar_url }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginTop: 20,
            alignSelf: "center",
          }}
        />
      ) : null}
    </View>
  );
};
