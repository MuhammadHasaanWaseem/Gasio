import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, HelpCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionItemProps {
  item: FAQItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({ item, index, isExpanded, onToggle }) => {
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
    height.value = withSpring(isExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(isExpanded ? 1 : 0, {
      duration: 200,
    });
  }, [isExpanded]);

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      maxHeight: interpolate(
        height.value,
        [0, 1],
        [0, 1000],
        Extrapolate.CLAMP
      ),
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 50).springify()}
    >
      <TouchableOpacity
        style={[
          styles.faqItem,
          isExpanded && styles.faqItemExpanded
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.questionRow}>
          <Text style={styles.questionNumber}>{index + 1}</Text>
          <Text style={styles.questionText}>{item.question}</Text>
          <Animated.View style={chevronStyle}>
            <ChevronDown 
              size={22} 
              color={isExpanded ? "#e91e63" : "#999"} 
            />
          </Animated.View>
        </View>
        <Animated.View style={[styles.answerContainer, contentStyle]}>
          {isExpanded && (
            <Text style={styles.answerText}>{item.answer}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const faqData: FAQItem[] = [
  {
    question: "How do I book a gas delivery?",
    answer: "Simply search for nearby vendors, select a service, choose your preferred date and time, then confirm your booking. You'll receive a confirmation and can track your order in real-time."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept multiple payment methods including credit/debit cards, mobile wallets, and cash on delivery. All digital payments are secured with encryption."
  },
  {
    question: "How can I track my order?",
    answer: "Go to the Orders tab to view all your bookings. You can see the current status, estimated delivery time, and contact the vendor directly if needed."
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes, you can cancel or reschedule your booking from the Orders section. Please note that cancellation policies may vary by vendor, and some may charge a fee for last-minute cancellations."
  },
  {
    question: "How do I find vendors near me?",
    answer: "Use the Search tab or Home screen to discover nearby gas vendors. You can filter by distance, ratings, and service type to find the best match for your needs."
  },
  {
    question: "What if I have an issue with my delivery?",
    answer: "Contact the vendor directly through the chat feature in the app, or reach out to our support team via AI Chat Support or Contact Support in the menu. We're here to help 24/7."
  },
  {
    question: "How do I leave a review for a vendor?",
    answer: "After your order is completed, you'll receive a prompt to leave a review. You can also go to your order history and tap on the completed order to rate and review the vendor."
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely! We use industry-standard encryption to protect your data. Your payment information is never stored on our servers, and we never share your personal details with third parties."
  },
  {
    question: "How do I update my profile information?",
    answer: "Go to Menu > Edit Profile to update your name, phone number, address, and profile picture. Make sure your information is up to date for smooth deliveries."
  },
  {
    question: "What areas does Gasio serve?",
    answer: "Gasio is available in multiple regions with new areas being added regularly. Use the app to check if vendors are available in your location."
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Header animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const backButtonScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateX = useSharedValue(-20);
  const effectOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    backButtonScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    titleOpacity.value = withTiming(1, { duration: 400 });
    titleTranslateX.value = withSpring(0, { damping: 15, stiffness: 100 });
    effectOpacity.value = withTiming(0.7, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateX: titleTranslateX.value }],
  }));

  const effectStyle = useAnimatedStyle(() => ({
    opacity: effectOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={headerStyle}>
        <LinearGradient
          colors={['#e91e63', '#ff5252']}
          style={[styles.header, { paddingTop: insets.top }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Animated.View style={backButtonStyle}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft color="#fff" size={28} />
              </TouchableOpacity>
            </Animated.View>
            <Animated.Text style={[styles.headerTitle, titleStyle]}>FAQ</Animated.Text>
            <View style={{ width: 28 }} />
          </View>
          <Animated.View style={[styles.header3DEffect, effectStyle]} />
        </LinearGradient>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.introCard}>
          <View style={styles.iconWrapper}>
            <HelpCircle size={40} color="#e91e63" />
          </View>
          <Text style={styles.introTitle}>Frequently Asked Questions</Text>
          <Text style={styles.introText}>
            Find answers to common questions about using Gasio
          </Text>
        </Animated.View>

        <View style={styles.faqList}>
          {faqData.map((item, index) => (
            <FAQAccordionItem
              key={index}
              item={item}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpand(index)}
            />
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(800)} style={styles.helpCard}>
          <Text style={styles.helpTitle}>Still have questions?</Text>
          <Text style={styles.helpText}>
            Contact our support team for personalized assistance
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => router.push('/supportforalluser')}
          >
            <LinearGradient
              colors={['#e91e63', '#ff5252']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.supportButtonGradient}
            >
              <Text style={styles.supportButtonText}>Chat with AI Support</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingBottom: height * 0.035,
    paddingHorizontal: width * 0.05,
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
    fontSize: width * 0.055,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  content: {
    padding: width * 0.04,
    paddingTop: height * 0.025,
    paddingBottom: height * 0.05,
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    alignItems: 'center',
    marginBottom: height * 0.025,
    elevation: 5,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconWrapper: {
    backgroundColor: '#fce4ec',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  introTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  introText: {
    fontSize: width * 0.035,
    color: '#6c757d',
    textAlign: 'center',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.04,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  faqItemExpanded: {
    borderColor: '#e91e63',
    borderWidth: 1.5,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fce4ec',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    color: '#e91e63',
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#2d3748',
    lineHeight: 22,
  },
  answerContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    overflow: 'hidden',
  },
  answerText: {
    fontSize: width * 0.035,
    color: '#4a5568',
    lineHeight: 22,
  },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    alignItems: 'center',
    marginTop: height * 0.025,
    elevation: 5,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  helpTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  helpText: {
    fontSize: width * 0.035,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 15,
  },
  supportButton: {
    width: '100%',
  },
  supportButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '700',
  },
});
