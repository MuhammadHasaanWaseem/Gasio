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
  Phone
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
      <LinearGradient
        colors={["#ed3237", "#ff5f6d"]}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <View style={{ width: 18 }} />
          <Text style={styles.headerTitle}>Vendor Profile</Text>
          <TouchableOpacity onPress={() => router.push('/Vendordrawer')}>
            <MenuIcon color={'white'} size={24} />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInUp.duration(600)} style={styles.avatarRow}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            {vendor?.profile_picture_url ? (
              <Image
                source={{ uri: `${vendor.profile_picture_url}?t=${Date.now()}` }} // cache buster
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
              <CheckCircle color="#007bff" fill="#007bff" size={18} />
              <Text style={styles.verifiedText}>Verified Vendor</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

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

    backgroundColor: "#fefefe",
  },
  headerBackground: {
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingTop: 20,
    marginTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
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
    fontWeight: "700",
  },
  nameVerifiedColumn: {
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
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
    paddingTop: 30,
  },
  itemContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#777",
    fontWeight: "600",
    marginLeft: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 2,
  },
});
