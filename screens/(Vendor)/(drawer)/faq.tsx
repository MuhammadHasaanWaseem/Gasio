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
    question: "How do I create a new service?",
    answer: "Go to the Services tab and tap the '+' button. Fill in your service details including name, description, price, and images. Once submitted, your service will be visible to customers."
  },
  {
    question: "How do I manage incoming orders?",
    answer: "Navigate to the Orders tab to view all incoming orders. You can accept, reject, or mark orders as completed. Customers are notified of status changes automatically."
  },
  {
    question: "How do I update my business profile?",
    answer: "Go to Menu > Edit Profile to update your business name, contact information, service areas, operating hours, and profile picture."
  },
  {
    question: "How do payments work for vendors?",
    answer: "Payments are processed securely through the app. You'll receive funds in your linked account after order completion. Check your dashboard for payment history and pending amounts."
  },
  {
    question: "Can I set my own prices?",
    answer: "Yes! You have full control over your service pricing. Set competitive prices based on your costs and market rates. You can update prices anytime from the Services tab."
  },
  {
    question: "How do I respond to customer reviews?",
    answer: "Go to the Ratings tab to see all customer reviews. While you can't respond directly, positive service and communication help build your reputation."
  },
  {
    question: "What if a customer cancels an order?",
    answer: "You'll be notified immediately when a customer cancels. Depending on the cancellation timing and your policies, appropriate measures will be applied."
  },
  {
    question: "How can I increase my visibility?",
    answer: "Maintain high ratings, respond quickly to orders, keep your profile updated with quality images, and offer competitive pricing. Verified vendors get priority in search results."
  },
  {
    question: "How do I contact customer support?",
    answer: "Use the AI Chat Support for instant help, or reach out via Contact Support for complex issues. Our team is available 24/7 to assist you."
  },
  {
    question: "Can I operate in multiple areas?",
    answer: "Yes, you can set multiple service areas in your profile. This helps customers in different locations find your services."
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
            <Animated.Text style={[styles.headerTitle, titleStyle]}>Vendor FAQ</Animated.Text>
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
          <Text style={styles.introTitle}>Vendor Help Center</Text>
          <Text style={styles.introText}>
            Answers to common questions for Gasio vendors
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
          <Text style={styles.helpTitle}>Need more help?</Text>
          <Text style={styles.helpText}>
            Our support team is ready to assist you
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
