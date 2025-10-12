// Using fixed colors for maximum readability as requested
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bot, ChevronLeft, MessageCircle, Send } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string };

const SUPPORT_EMAIL = 'jawadmalak557@gmail.com';
const SUPPORT_PHONE = '03154138864';

export default function AICChatSupportScreen() {
    const router = useRouter();
    const ACCENT = '#e91e63';
    const BG = '#ffffff';
    const TEXT = '#000000';
    const BUBBLE_BOT = '#f0f2f5';
    const BUBBLE_USER = '#f5f9ff';
    const BORDER = '#e3e6ea';
    const [input, setInput] = useState('');
    const [keyboardshown,setkeyboardshown]=useState(false); 
    const listRef = useRef<FlatList<ChatMsg>>(null);
    const [messages, setMessages] = useState<ChatMsg[]>([{
        id: String(Date.now()),
        role: 'assistant',
        text: 'Hi! I\'m Gasio Assistant. I can help with gas orders, pricing, delivery times, and support. Ask anything!'
    }]);
    const [sending, setSending] = useState(false);
    const HARDCODED_OPENROUTER_KEY = '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';
    const API_KEY = ((Constants?.expoConfig?.extra as any)?.openrouterApiKey as string | undefined) || HARDCODED_OPENROUTER_KEY;

    const scrollToEnd = () => {
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    };

    const generateReply = useMemo(() => {
        return (userText: string): string => {
            const q = userText.toLowerCase();

            // Contact info
            if (q.includes('email') || q.includes('e-mail') || q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('call') ) {
                return `You can reach Gasio support at ${SUPPORT_EMAIL} or ${SUPPORT_PHONE}. How can we help you today?`;
            }

            // Order placement / how to use
            if (q.includes('order') || q.includes('book') || q.includes('gas')) {
                return 'To order gas in Gasio: set your location, choose a nearby provider, select gas type and quantity, then confirm your order. You can track delivery in real-time and pay securely.';
            }

            // Pricing
            if (q.includes('price') || q.includes('cost') || q.includes('rate')) {
                return 'Pricing varies by provider and location. Open the search/browse screen to view nearby providers with live prices and ratings before placing an order.';
            }

            // Delivery time
            if (q.includes('deliver') || q.includes('eta') || q.includes('time') || q.includes('when')) {
                return 'Delivery ETAs depend on your location and provider availability. After you place an order, you\'ll see live driver tracking and an estimated arrival time.';
            }

            // Payment
            if (q.includes('pay') || q.includes('payment') || q.includes('method')) {
                return 'Gasio supports common payment methods depending on your region. At checkout, you\'ll see available options and can save a method for faster future orders.';
            }

            // Support
            if (q.includes('help') || q.includes('support') || q.includes('issue') || q.includes('problem')) {
                return `I\'m here to help. For account or order issues, please share details. You can also email us at ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE}.`;
            }

            // Default
            return 'Got it. I can assist with orders, prices, delivery, payments, and support. Ask me anything or say "contact" for our support details.';
        };
    }, []);
useEffect(()=>{
    Keyboard.addListener('keyboardDidShow',()=>{
        setkeyboardshown(true)
    })
    Keyboard.addListener('keyboardDidHide',()=>{
        setkeyboardshown(false)

    })

},[])
    async function generateReplyRemote(history: ChatMsg[], userText: string): Promise<string> {
        if (!API_KEY) throw new Error('Missing API key');
        const system = `You are Gasio AI Assistant for a gas delivery app. Be concise, helpful, and answer only for this domain (orders, pricing, delivery ETA, payments, app help). If the user asks for contact info, reply with email ${SUPPORT_EMAIL} and phone ${SUPPORT_PHONE}. Use simple language and short paragraphs.`;
        const payload = {
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: system },
                ...history.map(m => ({ role: m.role, content: m.text })),
                { role: 'user', content: userText },
            ],
            temperature: 0.3,
            max_tokens: 300,
        } as const;

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `API error: ${res.status}`);
        }
        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content || '';
        return (content as string).trim() || 'Sorry, I could not generate a reply right now.';
    }

    const onSend = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        const userMsg: ChatMsg = { id: `${Date.now()}-u`, role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        scrollToEnd();

        try {
            setSending(true);
            let replyText: string;
            if (API_KEY) {
                replyText = await generateReplyRemote(messages, trimmed);
            } else {
                replyText = generateReply(trimmed);
            }
            const reply: ChatMsg = { id: `${Date.now()}-a`, role: 'assistant', text: replyText };
            setMessages(prev => [...prev, reply]);
        } catch (e: any) {
            const fallback: ChatMsg = { id: `${Date.now()}-a`, role: 'assistant', text: `Temporary issue reaching AI service. I can still help with general questions. You can also contact us at ${SUPPORT_EMAIL} or ${SUPPORT_PHONE}.` };
            setMessages(prev => [...prev, fallback]);
        } finally {
            setSending(false);
            scrollToEnd();
        }
    };

    const renderItem = ({ item }: { item: ChatMsg }) => {
        const isUser = item.role === 'user';
            return (
                <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
                    {!isUser && (
                        <View style={[styles.avatar, { backgroundColor: ACCENT }]}>
                            <Bot size={18} color="#fff" />
                        </View>
                    )}
                    <View style={[styles.bubble, isUser ? [styles.userBubble, { backgroundColor: BUBBLE_USER, borderColor: BORDER }] : [styles.botBubble, { backgroundColor: BUBBLE_BOT, borderColor: BORDER }]]}>
                        <Text style={[styles.msgText, { color: TEXT }]}>{item.text}</Text>
                    </View>
                </View>
            );
    };

    return (
            <SafeAreaView style={[styles.screen, { backgroundColor: BG }]}>
            <StatusBar hidden={true} backgroundColor='transparent' style="dark" />
            <Animated.View entering={FadeIn.duration(250)}>
                <LinearGradient
                    colors={["#e91e63", "#ff5252"]}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ChevronLeft color="#fff" size={28} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>AI Chat Support</Text>
                        <View style={{ width: 28 }} />
                    </View>
                    <View style={styles.header3DEffect} />
                </LinearGradient>
            </Animated.View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.content, keyboardshown ? { flexGrow: 1 } : { flex: 1 }]}> 
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={(m) => m.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={scrollToEnd}
                        onLayout={scrollToEnd}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.inputBar}>
                        <MessageCircle size={20} color={ACCENT} />
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Type your message..."
                            placeholderTextColor="#9aa1a7"
                            style={[styles.input, { color: TEXT }]}
                            multiline
                        />
                        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: ACCENT, opacity: sending ? 0.6 : 1 }]} onPress={onSend} disabled={sending}>
                            <Send size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        zIndex: 10,
    },
    header3DEffect: {
        position: 'absolute',
        bottom: -20,
        left: 0,
        right: 0,
        height: 25,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        opacity: 0.7,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    content: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
    listContent: { paddingVertical: 8, paddingBottom: 12 },
    row: { flexDirection: 'row', marginBottom: 10, paddingHorizontal: 6 },
    rowStart: { justifyContent: 'flex-start' },
    rowEnd: { justifyContent: 'flex-end' },
    avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
    bubble: { maxWidth: '80%', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 },
        botBubble: { backgroundColor: '#f0f2f5', borderWidth: StyleSheet.hairlineWidth, borderColor: '#e3e6ea' },
        userBubble: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#e3e6ea' },
    msgText: { fontSize: 15, lineHeight: 20 },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e3e6ea',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginHorizontal: 6,
        marginBottom: 6,
    },
    input: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, minHeight: 36, maxHeight: 100 },
    sendBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
});