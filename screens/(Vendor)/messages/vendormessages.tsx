import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { MessageSquare, Search, User, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function VendorMessageScreen() {
    const { vendor } = useVendor();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        if (!vendor?.id) return;
        setRefreshing(true);

        try {
            const { data, error } = await supabase
                .from("orders")
                .select(
                    `
          id,
          service_id,
          user_id,
          status,
          user:user_id ( full_name, avatar_url ),
          service:service_id ( service_name )
        `
                )
                .eq("vendor_id", vendor.id)
                .in("status", ["Accepted", "In Progress", "Completed"])
                .order("order_time", { ascending: false });

            if (error) {
                console.log("Message Order Error:", error);
            } else {
                setOrders(data || []);
                setFiltered(data || []);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        const lower = text.toLowerCase();
        const filtered = orders.filter(
            (o) =>
                o.user?.full_name?.toLowerCase().includes(lower) ||
                o.service?.service_name?.toLowerCase().includes(lower)
        );
        setFiltered(filtered);
    };

    useEffect(() => {
        fetchOrders();
    }, [vendor?.id]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`./chat/${item.id}`)}
        >
            {item.user?.avatar_url ? (
                <Image
                    source={{ uri: item.user.avatar_url }}
                    style={styles.avatar}
                />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <User size={20} color="#6B7280" />
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.user?.full_name || "Customer"}
                </Text>
                <Text style={styles.service} numberOfLines={1}>
                    {item.service?.service_name || "Service"}
                </Text>
            </View>

            <View style={styles.statusContainer}>
                <Text
                    style={[
                        styles.status,
                        item.status === "Accepted" && styles.statusAccepted,
                        item.status === "In Progress" && styles.statusProgress,
                        item.status === "Completed" && styles.statusCompleted,
                    ]}
                >
                    {item.status}
                </Text>
            </View>

            <MessageSquare size={24} color="#3B82F6" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>

              <View style={{
                flexDirection:'row',alignItems:'center',gap:'5%'
              }}>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{color:'grey',fontSize:20,fontWeight:'900'}}>{'<'}</Text>

                </TouchableOpacity>
                <Text style={styles.title}>Messages</Text>
              </View>
                <Text style={styles.subtitle}>Communicate with your customers</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search by user or service..."
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={handleSearch}
                    style={styles.searchInput}
                />
                {
                    search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <X size={24} color={'grey'} />
                        </TouchableOpacity>
                    )
                }
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
            ) : filtered.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MessageSquare size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No conversations</Text>
                    <Text style={styles.emptyText}>
                        {search ? "No matches found" : "You have no active orders yet"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchOrders}
                            colors={["#3B82F6"]}
                            tintColor={"#3B82F6"}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 16,
    },
    header: {
        paddingVertical: 24,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1F2937",
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        marginTop: 8,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
    },
    loader: {
        marginTop: 80,
    },
    item: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 4,
    },
    service: {
        fontSize: 14,
        color: "#6B7280",
    },
    statusContainer: {
        marginRight: 16,
    },
    status: {
        fontSize: 12,
        fontWeight: "600",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: "hidden",
    },
    statusAccepted: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        color: "#3B82F6",
    },
    statusProgress: {
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        color: "#8B5CF6",
    },
    statusCompleted: {
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        color: "#10B981",
    },
    listContent: {
        paddingBottom: 32,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        marginTop: 20,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 15,
        color: "#6B7280",
        marginTop: 8,
        textAlign: "center",
    },
});