import { useUser } from "@/context/usercontext";
import { useVendor } from "@/context/vendorcontext";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  sent_at: string;
  is_read: boolean;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const { user } = useUser();
  const { vendor } = useVendor();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Fetch initial messages and customer info
  useEffect(() => {
    if (!orderId || !user?.id || !vendor?.id) return;

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch order details to get customer info
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("user_id")
          .eq("id", orderId)
          .single();
        
        if (orderError || !orderData) throw orderError || new Error("Order not found");
        
        // Fetch customer profile
        const { data: customerData, error: customerError } = await supabase
          .from("user_profiles")
          .select("id, full_name, avatar_url")
          .eq("id", orderData.user_id)
          .single();
        
        if (customerError || !customerData) throw customerError || new Error("Customer not found");
        
        setCustomer(customerData as UserProfile);
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("order_id", orderId)
          .order("sent_at", { ascending: true });
        
        if (messagesError) throw messagesError;
        
        setMessages(messagesData || []);
        
        // Mark messages as read
        await markMessagesAsRead();
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup real-time subscription
    const channel = supabase
      .channel(`messages:order_id=eq.${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          markMessagesAsRead();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [orderId, user?.id, vendor?.id]);

  const markMessagesAsRead = async () => {
    // Mark unread messages from customer as read
    const unreadMessages = messages.filter(
      msg => msg.receiver_id === user?.id && !msg.is_read
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg.id);
      
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", messageIds);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !orderId || !user?.id || !customer) return;
    
    setSending(true);
    
    try {
      const { error } = await supabase.from("messages").insert({
        order_id: orderId,
        sender_id: user.id,
        receiver_id: customer.id,
        message: newMessage.trim(),
      });
      
      if (error) throw error;
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSentByMe = item.sender_id === user?.id;
    const timestamp = new Date(item.sent_at);
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[
          styles.messageBubble,
          isSentByMe ? styles.sentMessage : styles.receivedMessage
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={[
          styles.messageTime,
          isSentByMe ? styles.sentTime : styles.receivedTime
        ]}>
          {timeString}
        </Text>
      </Animated.View>
    );
  };

  if (loading || !customer) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#e91e63", "#ff5252"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        
        <View style={styles.customerInfo}>
          {customer.avatar_url ? (
            <Image source={{ uri: customer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {customer.full_name.charAt(0)}
              </Text>
            </View>
          )}
          <Text style={styles.customerName}>{customer.full_name}</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          inverted
          onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Start a conversation with {customer.full_name}</Text>
              <Text style={styles.emptySubtext}>Your messages will appear here</Text>
            </View>
          }
        />
        
        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            editable={!sending}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  backButton: {
    padding: 8,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#e91e63",
    fontSize: 18,
    fontWeight: "bold",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#e91e63",
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  receivedMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  sentTime: {
    color: "rgba(255,255,255,0.7)",
  },
  receivedTime: {
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e91e63",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});