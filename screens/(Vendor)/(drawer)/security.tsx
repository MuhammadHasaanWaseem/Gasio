import Forgotpassword from "@/screens/auth/forgotpassword";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ForgotPasswordScreenWrapper() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={"#ed3237"} size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 26 }} /> {/* Spacer for symmetry */}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Forgot Password Form */}
      <View style={styles.content}>
        <Forgotpassword />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ed3237",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 16,
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
