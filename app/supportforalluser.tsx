import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Bot, Send, Trash2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

export default function AIChatSupport() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I'm your Gasio AI Assistant. How can I help you today? I can answer questions about gas services, bookings, payments, and more!",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
        const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // Hardcoded OpenAI API Key
    const OPENAI_API_KEY = "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";

    const sendMessageToOpenAI = async (userMessage: string) => {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are a helpful AI assistant for Gasio, a gas delivery and service booking application. 
              Help users with:
              - Gas delivery services and bookings
              - How to find nearby gas vendors
              - Booking process and order tracking
              - Payment methods and pricing
              - Account management and profile updates
              - Safety tips for gas usage
              - App navigation and features
              Keep responses concise, friendly, and helpful. If you don't know something specific about Gasio, suggest contacting support.`,
                        },
                        {
                            role: "user",
                            content: userMessage,
                        },
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            const data = await response.json();

            // Check if API key is expired or invalid
            if (response.status === 401 || response.status === 403) {
                return "I apologize, but my AI service is currently unavailable due to an expired API key. Please contact our support team for immediate assistance. You can also try these options:\n\n📧 Email: support@gasio.com\n📞 Phone: +1-800-GASIO\n💬 Live Chat: Available in Contact Support";
            }

            if (data.error) {
                if (data.error.code === "invalid_api_key" || data.error.code === "insufficient_quota") {
                    return "I apologize, but my AI service is currently unavailable. Our team has been notified. In the meantime, please contact our support team:\n\n📧 Email: support@gasio.com\n📞 Phone: +1-800-GASIO\n💬 Live Chat: Available in Contact Support";
                }
                throw new Error(data.error.message);
            }

            return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
        } catch (error) {
            console.error("OpenAI API Error:", error);
            return "I'm experiencing technical difficulties. Please try again in a moment. If the issue persists, please contact our support team:\n\n📧 Email: support@gasio.com\n📞 Phone: +1-800-GASIO\n💬 Live Chat: Available in Contact Support";
        }
    };

    const handleSend = async () => {
        if (inputText.trim() === "") return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        // Scroll to bottom
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Get AI response
        const aiResponse = await sendMessageToOpenAI(userMessage.text);

        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            sender: "bot",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);

        // Scroll to bottom after AI response
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const clearChat = () => {
        Alert.alert(
            "Clear Chat",
            "Are you sure you want to clear all messages?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                        setMessages([
                            {
                                id: "1",
                                text: "Hello! I'm your Gasio AI Assistant. How can I help you today?",
                                sender: "bot",
                                timestamp: new Date(),
                            },
                        ]);
                    },
                },
            ]
        );
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <View style={[styles.container, isKeyboardVisible ? { flex: 1 } : { flexGrow: 1 }]}>
            <LinearGradient
                colors={["#e91e63", "#ff5252"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>AI Chat Support</Text>
                        <Text style={styles.headerSubtitle}>Powered by OpenAI</Text>
                    </View>
                    <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
                        <Trash2 size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message, index) => (
                        <Animated.View
                            key={message.id}
                            entering={FadeInUp.delay(index * 50).duration(400)}
                            style={[
                                styles.messageWrapper,
                                message.sender === "user" ? styles.userMessageWrapper : styles.botMessageWrapper,
                            ]}
                        >
                            {message.sender === "bot" && (
                                <View style={styles.botIconContainer}>
                                    <Bot size={20} color="#e91e63" />
                                </View>
                            )}
                            <View
                                style={[
                                    styles.messageBubble,
                                    message.sender === "user" ? styles.userBubble : styles.botBubble,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.messageText,
                                        message.sender === "user" ? styles.userText : styles.botText,
                                    ]}
                                >
                                    {message.text}
                                </Text>
                                <Text
                                    style={[
                                        styles.timestamp,
                                        message.sender === "user" ? styles.userTimestamp : styles.botTimestamp,
                                    ]}
                                >
                                    {formatTime(message.timestamp)}
                                </Text>
                            </View>
                        </Animated.View>
                    ))}

                    {isLoading && (
                        <Animated.View
                            entering={FadeInDown.duration(300)}
                            style={[styles.messageWrapper, styles.botMessageWrapper]}
                        >
                            <View style={styles.botIconContainer}>
                                <Bot size={20} color="#e91e63" />
                            </View>
                            <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
                                <ActivityIndicator size="small" color="#e91e63" />
                                <Text style={[styles.messageText, styles.botText]}>Thinking...</Text>
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your message..."
                            placeholderTextColor="#999"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <LinearGradient
                                colors={!inputText.trim() || isLoading ? ["#ccc", "#999"] : ["#e91e63", "#ff5252"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.sendButtonGradient}
                            >
                                <Send size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
    },
    header: {
        paddingBottom: height * 0.025,
        paddingHorizontal: width * 0.05,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        elevation: 10,
        shadowColor: "#e91e63",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        padding: 8,
    },
    headerTextContainer: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        marginTop: 2,
    },
    clearButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        padding: 8,
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 10,
    },
    messageWrapper: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
    },
    userMessageWrapper: {
        justifyContent: "flex-end",
    },
    botMessageWrapper: {
        justifyContent: "flex-start",
    },
    botIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fce4ec",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: "75%",
        padding: 12,
        borderRadius: 18,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    userBubble: {
        backgroundColor: "#e91e63",
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: "#fff",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    loadingBubble: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: "#fff",
    },
    botText: {
        color: "#333",
    },
    timestamp: {
        fontSize: 10,
        marginTop: 6,
    },
    userTimestamp: {
        color: "rgba(255,255,255,0.7)",
        textAlign: "right",
    },
    botTimestamp: {
        color: "#999",
    },
    inputContainer: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: "#f8f8f8",
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#333",
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        marginLeft: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
});