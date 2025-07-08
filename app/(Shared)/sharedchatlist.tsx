import { useUser } from '@/context/usercontext';
import { useVendor } from '@/context/vendorcontext';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const tabs = [
  { key: 'all', label: 'All Contacts' },
  { key: 'chats', label: 'Active Chats' },
];

type Contact = {
  id: string;
  full_name: string;
  avatar_url?: string;
  profile_picture_url?: string;
};

const SharedContactList = () => {
  const { user, loading: userLoading } = useUser();
  const { vendor, loading: vendorLoading } = useVendor();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeChats, setActiveChats] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'chats'>('all');

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const isVendor = !!vendor;
  const currentUserId = vendor?.id || user?.id;
  const currentSenderRole = vendor ? 'vendor' : 'user';

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const { data: contactData, error } = isVendor
          ? await supabase.from('user_profiles').select('id, full_name, avatar_url')
          : await supabase.from('vendor_owners').select('id, full_name, profile_picture_url');

        if (error) throw error;

        const { data: chatData } = await supabase
          .from('messages')
          .select('receiver_id, sender_id')
          .or(`receiver_id.eq.${currentUserId},sender_id.eq.${currentUserId}`);

        const uniqueChatIds = Array.from(
          new Set(
            chatData
              ?.map((msg) => (msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id))
              .filter((id): id is string => Boolean(id)) || []
          )
        );

        const fetchedContacts = contactData || [];
        const active = fetchedContacts.filter((c) => uniqueChatIds.includes(c.id));

        setContacts(fetchedContacts);
        setActiveChats(active);
        setFilteredContacts(activeTab === 'chats' ? active : fetchedContacts);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading && !vendorLoading) fetchContacts();
  }, [activeTab, userLoading, vendorLoading]);

  useEffect(() => {
    const targetList = activeTab === 'chats' ? activeChats : contacts;
    if (searchQuery) {
      const filtered = targetList.filter((contact) =>
        contact.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(targetList);
    }
  }, [searchQuery, contacts, activeChats, activeTab]);

  const handleChat = (contact: Contact) => {
    router.push({
      pathname: '/chat',
      params: {
        receiver_id: contact.id,
        receiver_name: contact.full_name,
        receiver_avatar: contact.avatar_url || contact.profile_picture_url || '',
        sender_id: currentUserId,
        sender_role: currentSenderRole,
        receiver_role: isVendor ? 'user' : 'vendor',
      },
    });
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key as 'all' | 'chats')}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContactCard = ({ item }: { item: Contact }) => (
    <TouchableOpacity onPress={() => handleChat(item)} style={styles.contactCard}>
      <Image
        source={
          item.avatar_url
            ? { uri: item.avatar_url }
            : item.profile_picture_url
            ? { uri: item.profile_picture_url }
            : require('../../assets/images/placeholder.png')
        }
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.messageHint}>Tap to message</Text>
      </View>
      <Feather name="message-circle" size={20} color="#6C63FF" />
    </TouchableOpacity>
  );

  if (loading || userLoading || vendorLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.headerTitle}>
        Communication with {isVendor ? 'Users' : 'Vendors'}
      </Text>

      {renderTabs()}

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={'grey'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredContacts.filter((c) => c.id !== currentUserId)}
        keyExtractor={(item) => item.id}
        renderItem={renderContactCard}
        contentContainerStyle={styles.listContainer}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor:'white'},
  loadingText: { marginTop: 12, fontSize: 16, color: '#6C63FF' },
  tabContainer: { flexDirection: 'row', marginBottom: 16 },
  tab: { flex: 1, padding: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#6C63FF' },
  tabText: { textAlign: 'center', color: '#999' },
  activeTabText: { color: '#6C63FF', fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40 },
  listContainer: { paddingBottom: 30 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  textContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' ,color:'black'},
  messageHint: { fontSize: 12, color: 'black' },
});

export default SharedContactList;
