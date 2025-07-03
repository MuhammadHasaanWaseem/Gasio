import { useVendor } from "@/context/vendorcontext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Briefcase,
  CalendarDays,
  CheckCircle,
  Mail,
  MapPin,
  MenuIcon,
  Phone,
} from "lucide-react-native";
import React, { JSX, useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function VendorProfile() {
  const router = useRouter();
  const { vendor, vendorBusiness } = useVendor();
  const [modalVisible, setModalVisible] = useState(false);

  const joinedDate = vendor?.created_at
    ? new Date(vendor.created_at).toLocaleDateString()
    : "N/A";

  const images = [
    {
      url: vendor?.profile_picture_url || "",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient and 3D glow */}
      <LinearGradient
        colors={['#e91e63', '#ff5252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Vendor Profile</Text>
          <TouchableOpacity onPress={() => router.push('/Vendordrawer')}>
            <MenuIcon color={'white'} size={24} />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.avatarRow}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            {vendor?.profile_picture_url ? (
              <Image
                source={{ uri: `${vendor.profile_picture_url}?t=${Date.now()}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {vendor?.full_name ? vendor.full_name.charAt(0) : "V"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.nameVerifiedColumn}>
            <Text style={styles.name}>{vendor?.full_name || "N/A"}</Text>
            <View style={styles.verifiedRow}>
              <CheckCircle color="green" fill="lightblue" size={18} />
              <Text style={styles.verifiedText}>Verified Vendor</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Info Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View entering={FadeInUp.delay(100).duration(600)}>
          <ProfileItem
            label="Business Name"
            value={vendorBusiness?.business_name || "N/A"}
            icon={<Briefcase color="#ed3237" size={20} />}
          />
          <ProfileItem
            label="Email"
            value={vendor?.email || "N/A"}
            icon={<Mail color="#ed3237" size={20} />}
          />
          <ProfileItem
            label="Phone"
            value={vendor?.phone || "N/A"}
            icon={<Phone color="#ed3237" size={20} />}
          />
          <ProfileItem
            label="Address"
            value={vendorBusiness?.address || "N/A"}
            icon={<MapPin color="#ed3237" size={20} />}
          />
          <ProfileItem
            label="Joined At"
            value={joinedDate}
            icon={<CalendarDays color="#ed3237" size={20} />}
          />
          
        </Animated.View>
      </ScrollView>

      {/* Profile Image Modal */}
      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <ImageViewer imageUrls={images} enableSwipeDown onSwipeDown={() => setModalVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

function ProfileItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: JSX.Element;
}) {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.iconLabelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  headerBackground: {
    paddingBottom: 70,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    paddingTop: 30,
    marginTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 105,
    height: 105,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 105,
    height: 105,
    borderRadius: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ed3237",
    borderWidth: 3,
  },
  avatarPlaceholderText: {
    color: "#ed3237",
    fontSize: 40,
    fontWeight: "bold",
  },
  nameVerifiedColumn: {
    marginLeft: 18,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    maxWidth: 200,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  verifiedText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  itemContainer: {
    marginBottom: 18,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    borderWidth: 0.4,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
    marginLeft: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
    flexWrap: "wrap",
  },
});
