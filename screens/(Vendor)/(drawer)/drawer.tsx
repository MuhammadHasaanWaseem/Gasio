import { useAuth } from "@/context/authcontext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function MenuScreen() {
  const { logout } = useAuth();

  const menuItems = [
    "Edit Profile",
    "Password and Security",
    "Create/Update Business Profile",
    "Add Payment Method",
    "Logout",
    "How To Use",
    "Privacy Policy",
    "Terms of Use",
    "More",
  ];

  const handlePress = (item: string) => {
    switch (item) {
      case "Edit Profile":
        router.push("/editprofile");
        break;
      case "Password and Security":
        router.push("/security");
        break;
      case "Create/Update Business Profile":
        router.push("/BusinessProfile");
        break;
      case "Add Payment Method":
        router.push("/AddPayment");
        break;
      case "Logout":
        logout();
        Alert.alert("Logged out", "You have been logged out successfully.");
        break;
      case "How To Use":
        router.push("/HowToUse");
        break;
      case "Privacy Policy":
        router.push("/PrivacyPolicy");
        break;
      case "Terms of Use":
        router.push("/trermofuse");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#ed3237", "#ff5f6d"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 26 }} />
           {/* Spacer for alignment */}
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView contentContainerStyle={styles.menuWrapper}>
        {menuItems.map((item, index) => (
          <Animated.View
            key={item}
            entering={FadeInDown.delay(index * 90).duration(400)}
            style={styles.cardWrapper}
          >
            <TouchableOpacity
              onPress={() => handlePress(item)}
              style={styles.card}
            >
              <Text style={styles.menuText}>{item}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  menuWrapper: {
    padding: 20,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
