import { useUser } from '@/context/usercontext';
import { useVendor } from '@/context/vendorcontext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

type MessageType = {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  sender_role: 'user' | 'vendor';
  receiver_role: 'user' | 'vendor';
  sent_at: string;
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<MessageType>);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ChatScreen = () => {
  const { user } = useUser();
  const { vendor } = useVendor();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');

  const {
    receiver_id,
    receiver_name,
    receiver_avatar,
    receiver_role,
  } = useLocalSearchParams<{
    receiver_id: string;
    receiver_name: string;
    receiver_avatar: string;
    sender_id: string;
    sender_role: 'user' | 'vendor';
    receiver_role: 'user' | 'vendor';
  }>();

  const currentSenderId = vendor?.id || user?.id;
  const currentSenderRole = vendor ? 'vendor' : 'user';

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentSenderId},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${currentSenderId})`
      )
      .order('sent_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: currentSenderId,
        receiver_id,
        sender_role: currentSenderRole,
        receiver_role,
        message: inputText.trim(),
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setInputText('');
    }
  };

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel('message_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
const newMessage = payload.new as MessageType;
          if (
            (newMessage.sender_id === currentSenderId &&
              newMessage.receiver_id === receiver_id) ||
            (newMessage.sender_id === receiver_id &&
              newMessage.receiver_id === currentSenderId)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentSenderId, receiver_id]);

  const renderMessage = ({ item, index }: { item: MessageType; index: number }) => {
    const isSender = item.sender_id === currentSenderId;
    const isFirstInGroup = index === 0 || messages[index - 1]?.sender_id !== item.sender_id;
    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender_id !== item.sender_id;

    const avatarUri = isSender
  ? (currentSenderRole === 'vendor'
      ? vendor?.avatar_url
      : user?.avatar_url) || require('../../assets/images/placeholder.png')
  : receiver_avatar || require('../../assets/images/placeholder.png');
    return (
      <Animated.View 
        layout={Layout.springify()}
        entering={isSender ? FadeInDown : FadeInUp}
        style={[
          styles.messageRow, 
          isSender ? styles.rightAlign : styles.leftAlign,
          { marginBottom: isLastInGroup ? 12 : 4 }
        ]}
      >
        {isLastInGroup && (
          <Image
            source={typeof avatarUri === 'string' ? { uri: avatarUri } : avatarUri}
            style={styles.bubbleAvatar}
          />
        )}
        
        {!isLastInGroup && (
          <View style={styles.bubbleAvatarPlaceholder} />
        )}
        
        <LinearGradient
          colors={isSender ? ['#6C63FF', '#4A45FF'] : ['#f1f1f1', '#eaeaea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.messageBubble, 
            isSender ? styles.senderBubble : styles.receiverBubble,
            {
              borderTopLeftRadius: isFirstInGroup ? 16 : 6,
              borderTopRightRadius: isFirstInGroup ? 16 : 6,
            }
          ]}
        >
          <Text style={isSender ? styles.senderText : styles.receiverText}>{item.message}</Text>
          <Text style={[styles.timestamp, isSender && styles.senderTimestamp]}>
            {new Date(item.sent_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#fafafa', '#ffffff']} style={styles.container}>
      {/* Header */}
      <LinearGradient
      colors={['#ed3237', '#ff5f6d']}        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Image
          source={
            receiver_avatar
              ? { uri: receiver_avatar }
              : require('../../assets/images/placeholder.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.receiverName}>{receiver_name}</Text>
      </LinearGradient>

      {/* Messages */}
      <AnimatedFlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write a message..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <AnimatedTouchableOpacity 
            onPress={sendMessage} 
            style={styles.sendButton}
            entering={FadeInDown.delay(100)}
          >
            <Send size={20} color="#fff" strokeWidth={2} />
          </AnimatedTouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  receiverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  leftAlign: {
    justifyContent: 'flex-start',
  },
  rightAlign: {
    justifyContent: 'flex-end',
  },
  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bubbleAvatarPlaceholder: {
    width: 32,
    marginHorizontal: 6,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  senderBubble: {
    borderBottomRightRadius: 4,
    
  },
  receiverBubble: {
    borderBottomLeftRadius: 4,
  },
  senderText: {
    color: '#fff',
    fontSize: 16,
  },
  receiverText: {
    color: '#333',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  senderTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 70,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});