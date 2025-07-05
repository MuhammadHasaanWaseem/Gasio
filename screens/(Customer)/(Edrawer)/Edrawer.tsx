import { useAuth } from "@/context/authcontext";
import { useUser } from "@/context/usercontext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  User
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function MenuScreen() {
  const { logout } = useAuth();
  const {user}=useUser();
  const [activeTab, setActiveTab] = useState("settings");

  const settingsItems = [
    { title: "Edit Profile", icon: <User size={24} color="#e91e63" /> },
    { title: "Password and Security", icon: <Lock size={24} color="#e91e63" /> },
    { title: "Add Payment Method", icon: <CreditCard size={24} color="#e91e63" /> },
    { title: "Logout", icon: <LogOut size={24} color="#ff1744" /> },
  ];

  const supportItems = [
    { title: "How To Use", icon: <HelpCircle size={24} color="#ff5252" /> },
    { title: "Privacy Policy", icon: <Shield size={24} color="#ff5252" /> },
    { title: "Terms of Use", icon: <FileText size={24} color="#ff5252" /> },
    { title: "Contact Support", icon: <MessageSquare size={24} color="#ff5252" /> },
    { title: "About", icon: <Info size={24} color="#ff5252" /> },
  ];

  const handlePress = (item: string) => {
    switch (item) {
      case "Edit Profile":
        router.push("/updateprofile");
        break;
      case "Password and Security":
        router.push("/security");
        break;
      case "Add Payment Method":
        // router.push("/AddPayment");
          ToastAndroid.show(
          "Expo go Doesn't support this feature yet.",
          ToastAndroid.SHORT
        );
        break;
      case "Logout":
        logout();
        ToastAndroid.show(
          "You have been logged out successfully.",
          ToastAndroid.SHORT
        );
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
      case "Contact Support":
                router.push("/contactsupport");

      
        break;
      case "About":
        router.push('/about')
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e91e63", "#ff5252"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={26} color="#fff" />
          </TouchableOpacity>
          <Animated.Text entering={FadeInDown} style={styles.headerTitle}>
            Menu
          </Animated.Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.header3DEffect} />

        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.profileCard}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatarPlaceholder}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: `${user?.avatar_url}?t=${Date.now()}` }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.full_name ? user.full_name.charAt(0) : "U"}
                </Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.full_name || "User"}</Text>
              <Text style={styles.userEmail}>{user?.country_code}{user?.phone || "user@example.com"}</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.tabsContainer}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Settings size={20} color={activeTab === "settings" ? "#fff" : "#e91e63"} />
          <Text
            style={[
              styles.tabText,
              activeTab === "settings" && styles.activeTabText,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "support" && styles.activeTab]}
          onPress={() => setActiveTab("support")}
        >
          <HelpCircle size={20} color={activeTab === "support" ? "#fff" : "#e91e63"} />
          <Text
            style={[
              styles.tabText,
              activeTab === "support" && styles.activeTabText,
            ]}
          >
            Support
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.menuWrapper}>
        {activeTab === "settings" &&
          settingsItems.map((item, index) => (
            <Animated.View
              key={item.title}
              entering={FadeInDown.delay(index * 100).duration(500)}
              layout={Layout.springify()}
              style={styles.cardWrapper}
            >
              <TouchableOpacity
                onPress={() => handlePress(item.title)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  {item.icon}
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrow}>{">"}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}

        {activeTab === "support" &&
          supportItems.map((item, index) => (
            <Animated.View
              key={item.title}
              entering={FadeInDown.delay(index * 100).duration(500)}
              layout={Layout.springify()}
              style={styles.cardWrapper}
            >
              <TouchableOpacity
                onPress={() => handlePress(item.title)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  {item.icon}
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrow}>{">"}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
      </ScrollView>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Gasio v1.2.5</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fef1f3" },
  header: {
    paddingTop: 60,
    paddingBottom: 90,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    zIndex: 10,
    overflow: "hidden",
  },
  header3DEffect: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    height: 25,
    backgroundColor: "#d81b60",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.7,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    elevation: 8,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    transform: [{ translateY: 40 }],
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e91e63",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
  },
  userEmail: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    elevation: 5,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginHorizontal: 20,
    marginTop: 50,
    marginBottom: 20,
    zIndex: 5,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#e91e63",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e91e63",
  },
  activeTabText: {
    color: "#fff",
  },
  menuWrapper: {
    padding: 20,
    paddingBottom: 80,
  },
  cardWrapper: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#f8d7da",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5568",
    letterSpacing: 0.3,
  },
  cardArrow: {
    backgroundColor: "#fce4ec",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e91e63",
  },
  versionContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#a0aec0",
  },
});
