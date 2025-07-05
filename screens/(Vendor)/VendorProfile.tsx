// import { useVendor } from "@/context/vendorcontext";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import {
//   Briefcase,
//   CalendarDays,
//   CheckCircle,
//   Mail,
//   MapPin,
//   MenuIcon,
//   Phone,
// } from "lucide-react-native";
// import React, { JSX, useState } from "react";
// import {
//   Image,
//   Modal,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import ImageViewer from "react-native-image-zoom-viewer";
// import Animated, { FadeInUp } from "react-native-reanimated";

// export default function VendorProfile() {
//   const router = useRouter();
//   const { vendor, vendorBusiness } = useVendor();
//   const [modalVisible, setModalVisible] = useState(false);

//   const joinedDate = vendor?.created_at
//     ? new Date(vendor.created_at).toLocaleDateString()
//     : "N/A";

//   const images = [
//     {
//       url: vendor?.profile_picture_url || "",
//     },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header with Gradient and 3D glow */}
//       <LinearGradient
//         colors={['#e91e63', '#ff5252']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.headerBackground}
//       >
//         <View style={styles.header}>
//           <View style={{ width: 24 }} />
//           <Text style={styles.headerTitle}>Vendor Profile</Text>
//           <TouchableOpacity onPress={() => router.push('/Vendordrawer')}>
//             <MenuIcon color={'white'} size={24} />
//           </TouchableOpacity>
//         </View>

//         {/* Avatar Section */}
//         <Animated.View entering={FadeInUp.duration(600)} style={styles.avatarRow}>
//           <TouchableOpacity onPress={() => setModalVisible(true)}>
//             {vendor?.profile_picture_url ? (
//               <Image
//                 source={{ uri: `${vendor.profile_picture_url}?t=${Date.now()}` }}
//                 style={styles.avatar}
//               />
//             ) : (
//               <View style={styles.avatarPlaceholder}>
//                 <Text style={styles.avatarPlaceholderText}>
//                   {vendor?.full_name ? vendor.full_name.charAt(0) : "V"}
//                 </Text>
//               </View>
//             )}
//           </TouchableOpacity>
//           <View style={styles.nameVerifiedColumn}>
//             <Text style={styles.name}>{vendor?.full_name || "N/A"}</Text>
//             <View style={styles.verifiedRow}>
//               <CheckCircle color="green" fill="lightblue" size={18} />
//               <Text style={styles.verifiedText}>Verified Vendor</Text>
//             </View>
//           </View>
//         </Animated.View>
//       </LinearGradient>

//       {/* Info Cards */}
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Animated.View entering={FadeInUp.delay(100).duration(600)}>
//           <ProfileItem
//             label="Business Name"
//             value={vendorBusiness?.business_name || "N/A"}
//             icon={<Briefcase color="#ed3237" size={20} />}
//           />
//           <ProfileItem
//             label="Email"
//             value={vendor?.email || "N/A"}
//             icon={<Mail color="#ed3237" size={20} />}
//           />
//           <ProfileItem
//             label="Phone"
//             value={vendor?.phone || "N/A"}
//             icon={<Phone color="#ed3237" size={20} />}
//           />
//           <ProfileItem
//             label="Address"
//             value={vendorBusiness?.address || "N/A"}
//             icon={<MapPin color="#ed3237" size={20} />}
//           />
//           <ProfileItem
//             label="Joined At"
//             value={joinedDate}
//             icon={<CalendarDays color="#ed3237" size={20} />}
//           />
          
//         </Animated.View>
//       </ScrollView>

//       {/* Profile Image Modal */}
//       <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
//         <ImageViewer imageUrls={images} enableSwipeDown onSwipeDown={() => setModalVisible(false)} />
//       </Modal>
//     </SafeAreaView>
//   );
// }

// function ProfileItem({
//   label,
//   value,
//   icon,
// }: {
//   label: string;
//   value: string;
//   icon: JSX.Element;
// }) {
//   return (
//     <View style={styles.itemContainer}>
//       <View style={styles.iconLabelRow}>
//         {icon}
//         <Text style={styles.label}>{label}</Text>
//       </View>
//       <Text style={styles.value}>{value}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f6f8fa",
//   },
//   headerBackground: {
//     paddingBottom: 70,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 10,
//     shadowColor: "#e91e63",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.25,
//     shadowRadius: 12,
//   },
//   header: {
//     paddingTop: 30,
//     marginTop: 20,
//     paddingBottom: 15,
//     paddingHorizontal: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "900",
//     color: "#fff",
//     textShadowColor: "rgba(0,0,0,0.3)",
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 3,
//   },
//   avatarRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 30,
//     paddingHorizontal: 20,
//   },
//   avatar: {
//     width: 105,
//     height: 105,
//     borderRadius: 999,
//     borderWidth: 3,
//     borderColor: "#fff",
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.2,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   avatarPlaceholder: {
//     width: 105,
//     height: 105,
//     borderRadius: 999,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderColor: "#ed3237",
//     borderWidth: 3,
//   },
//   avatarPlaceholderText: {
//     color: "#ed3237",
//     fontSize: 40,
//     fontWeight: "bold",
//   },
//   nameVerifiedColumn: {
//     marginLeft: 18,
//     justifyContent: "center",
//   },
//   name: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#fff",
//     maxWidth: 200,
//     textShadowColor: "rgba(0,0,0,0.25)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   verifiedRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   verifiedText: {
//     color: "#fff",
//     marginLeft: 6,
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   scrollContainer: {
//     padding: 20,
//     paddingTop: 40,
//   },
//   itemContainer: {
//     marginBottom: 18,
//     backgroundColor: "#fff",
//     padding: 18,
//     borderRadius: 16,
//     borderWidth: 0.4,
//     borderColor: "#eee",
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 3,
//   },
//   iconLabelRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   label: {
//     fontSize: 14,
//     color: "#999",
//     fontWeight: "600",
//     marginLeft: 10,
//   },
//   value: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#333",
//     marginTop: 4,
//     flexWrap: "wrap",
//   },
// });
import { useVendor } from "@/context/vendorcontext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Edit,
  Globe,
  Mail,
  MapPin,
  Menu,
  Phone,
  Shield,
  Star,
  Users
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

  // Business stats
  const stats = [
    { 
      label: "Completed Orders", 
      value: vendorBusiness?.total_orders || "0",
      icon: <CheckCircle size={20} color="#e91e63" /> 
    },
    { 
      label: "Average Rating", 
      value: vendorBusiness?.rating ? `${vendorBusiness.rating}/5` : "N/A",
      icon: <Star size={20} color="#e91e63" /> 
    },
    { 
      label: "Business Status", 
      value: vendorBusiness?.is_available ? "Active" : "Inactive",
      icon: <BadgeCheck size={20} color="#e91e63" /> 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#e91e63', '#ff5252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Vendor Profile</Text>
          <TouchableOpacity 
            onPress={() => router.push('/Vendordrawer')} 
            style={styles.menuButton}
          >
            <Menu color={'white'} size={24} />
          </TouchableOpacity>
        </View>

        {/* Profile Header Section */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.profileHeader}>
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
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{vendor?.full_name || "N/A"}</Text>
            
            <View style={styles.verifiedRow}>
              <CheckCircle color="#4CAF50" size={18} />
              <Text style={styles.verifiedText}>Verified Vendor</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/editprofile')}
            >
              <Edit size={16} color="#e91e63" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Business Stats */}
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIcon}>
              {stat.icon}
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Business Information */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <ProfileItem
            label="Business Name"
            value={vendorBusiness?.business_name || "N/A"}
            icon={<Briefcase color="#e91e63" size={20} />}
          />
          <ProfileItem
            label="Business License"
            value={vendorBusiness?.business_license || "Not provided"}
            icon={<Shield color="#e91e63" size={20} />}
          />
          <ProfileItem
            label="Website"
            value={vendorBusiness?.website?.toLowerCase() || "Not provided"}
            icon={<Globe color="#e91e63" size={20} />}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <ProfileItem
            label="Email"
            value={vendor?.email || "N/A"}
            icon={<Mail color="#e91e63" size={20} />}
          />
          <ProfileItem
            label="Phone"
            value={`${vendor?.country_code}${vendor?.phone}` || "N/A"}
            icon={<Phone color="#e91e63" size={20} />}
          />
          <ProfileItem
            label="Address"
            value={vendorBusiness?.address || "N/A"}
            icon={<MapPin color="#e91e63" size={20} />}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          <ProfileItem
            label="Member Since"
            value={joinedDate}
            icon={<CalendarDays color="#e91e63" size={20} />}
          />
          <ProfileItem
            label="Account Type"
            value={"Vendor"}
            icon={<Users color="#e91e63" size={20} />}
          />
        </Animated.View>
      </ScrollView>

      {/* Profile Image Modal */}
      <Modal 
        visible={modalVisible} 
        transparent={true} 
        onRequestClose={() => setModalVisible(false)}
      >
        <ImageViewer 
          imageUrls={images} 
          enableSwipeDown 
          onSwipeDown={() => setModalVisible(false)} 
          backgroundColor="rgba(0,0,0,0.9)"
        />
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
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  headerBackground: {
    paddingBottom: 90,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: "hidden",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  menuButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarPlaceholderText: {
    color: "#e91e63",
    fontSize: 38,
    fontWeight: "bold",
  },
  profileInfo: {
    marginLeft: 20,
    justifyContent: "center",
    flex: 1,
  },
  name: {
    fontSize: 22,
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
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  verifiedText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 12,
    elevation: 2,
  },
  editButtonText: {
    color: "#e91e63",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statIcon: {
    backgroundColor: "#fce4ec",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#e91e63",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: "#fce4ec",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flexWrap: "wrap",
  },
});