import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, BookOpen, Check, ChevronLeft, Phone, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function HowToUseScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('english'); // 'english' or 'urdu'
  
  const isEnglish = language === 'english';

  return (
    <View style={styles.container}>
      {/* 3D Header with Gradient */}
      <Animated.View entering={FadeIn.duration(500)}>
        <LinearGradient
 colors={["#e91e63", "#ff5252"]}          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEnglish ? "How to Use Gasio" : "گیسیو کیسے استعمال کریں"}
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.header3DEffect} />
        </LinearGradient>
      </Animated.View>

      {/* Language Selector */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.languageSelector}>
        <TouchableOpacity 
          style={[styles.languageButton, language === 'english' && styles.activeLanguage]}
          onPress={() => setLanguage('english')}
        >
          <Text style={[styles.languageText, language === 'english' && styles.activeLanguageText]}>
            English
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.languageButton, language === 'urdu' && styles.activeLanguage]}
          onPress={() => setLanguage('urdu')}
        >
          <Text style={[styles.languageText, language === 'urdu' && styles.activeLanguageText]}>
            اردو
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.card}>
          <Animated.Text entering={FadeInDown.delay(300)} style={styles.title}>
            {isEnglish 
              ? "Your Step-by-Step Guide" 
              : "آپکی قدم بہ قدم رہنمائی"}
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(400)} style={styles.subtitle}>
            {isEnglish 
              ? "Learn how to order gas in just a few taps" 
              : "صرف چند کلکس میں گیس آرڈر کرنا سیکھیں"}
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(500)} style={styles.divider} />

          {/* Tutorial Video */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Play size={24} color="#1e88e5" />
              <Text style={styles.sectionTitle}>
                {isEnglish ? "Video Tutorial" : "ویڈیو سبق"}
              </Text>
            </View>
            <View style={styles.videoPlaceholder}>
              {/* <Image 
                source={require('../../../assets/images/video-thumbnail.png')} 
                style={styles.videoImage}
              /> */}
              <View style={styles.playButton}>
                <Play size={36} color="#fff" fill="#fff" />
              </View>
            </View>
            <Text style={styles.videoCaption}>
              {isEnglish 
                ? "Watch this 2-minute tutorial to get started" 
                : "شروع کرنے کے لیے یہ 2 منٹ کا سبق دیکھیں"}
            </Text>
          </Animated.View>

          {/* Step-by-Step Guide */}
          <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={24} color="#1e88e5" />
              <Text style={styles.sectionTitle}>
                {isEnglish ? "Step-by-Step Guide" : "قدم بہ قدم رہنمائی"}
              </Text>
            </View>
            
            {steps.map((step, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(800 + index * 100).springify()}
                style={styles.stepContainer}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {isEnglish ? step.title : step.titleUrdu}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {isEnglish ? step.description : step.descriptionUrdu}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Tips & Tricks */}
          <Animated.View entering={FadeInUp.delay(1200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={24} color="#1e88e5" />
              <Text style={styles.sectionTitle}>
                {isEnglish ? "Pro Tips" : "پیشہ ورانہ تجاویز"}
              </Text>
            </View>
            
            <View style={styles.tipsContainer}>
              {tips.map((tip, index) => (
                <Animated.View 
                  key={index} 
                  entering={FadeInUp.delay(1300 + index * 100).springify()}
                  style={styles.tipCard}
                >
                  <View style={styles.tipIcon}>
                    <Check size={18} color="#1e88e5" />
                  </View>
                  <Text style={styles.tipText}>
                    {isEnglish ? tip.text : tip.textUrdu}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Support Section */}
          <Animated.View entering={FadeInUp.delay(1600)} style={styles.supportSection}>
            <Text style={styles.supportTitle}>
              {isEnglish 
                ? "Need more help? Contact our support team!" 
                : "مزید مدد چاہیے؟ ہمارے سپورٹ ٹیم سے رابطہ کریں!"}
            </Text>
            <TouchableOpacity style={styles.supportButton}>
              <Phone size={20} color="#fff" />
              <Text style={styles.supportButtonText}>
                {isEnglish ? "Contact Support" : "سپورٹ سے رابطہ کریں"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const steps = [
  {
    title: "Create Your Account",
    titleUrdu: "اپنا اکاؤنٹ بنائیں",
    description: "Sign up with your Email  and phone number and complete your profile",
    descriptionUrdu: "اپنے فون نمبر اردو Email کے ساتھ سائن اپ کریں اور اپنا پروفائل مکمل کریں"
  },
  {
    title: "Set Your Location",
    titleUrdu: "اپنا مقام سیٹ کریں",
    description: "Allow location access or enter your address manually for delivery",
    descriptionUrdu: "ڈیلیوری کے لیے لوکیشن کی رسائی دیں یا اپنا پتہ دستی طور پر درج کریں"
  },
  {
    title: "Browse Nearby Providers",
    titleUrdu: "قریبی فراہم کنندگان براؤز کریں",
    description: "View available gas providers in your area with ratings and prices",
    descriptionUrdu: "اپنے علاقے میں دستیاب گیس فراہم کنندگان کو درجہ بندی اور قیمتوں کے ساتھ دیکھیں"
  },
  {
    title: "Place Your Order",
    titleUrdu: "اپنا آرڈر دیں",
    description: "Select gas type and quantity, then confirm your order",
    descriptionUrdu: "گیس کی قسم اور مقدار منتخب کریں، پھر اپنا آرڈر تصدیق کریں"
  },
  {
    title: "Track Your Delivery",
    titleUrdu: "اپنی ڈیلیوری ٹریک کریں",
    description: "Follow your driver in real-time on the map until delivery",
    descriptionUrdu: "ڈیلیوری تک اپنے ڈرائیور کو نقشے پر رئیل ٹائم ٹریک کریں"
  },
  {
    title: "Rate Your Experience",
    titleUrdu: "اپنے تجربے کی درجہ بندی کریں",
    description: "Help us improve by rating your delivery experience",
    descriptionUrdu: "اپنے ڈیلیوری کے تجربے کی درجہ بندی کرکے ہمیں بہتر بنانے میں مدد کریں"
  }
];

const tips = [
  {
    text: "Schedule recurring deliveries to never run out of gas",
    textUrdu: "گیس ختم ہونے سے بچنے کے لیے بار بار ہونے والی ڈیلیوریز کا شیڈول بنائیں"
  },
  {
    text: "Save your payment methods for faster checkout",
    textUrdu: "تیز چیک آؤٹ کے لیے اپنے ادائیگی کے طریقے محفوظ کریں"
  },
  {
    text: "Use the emergency button for urgent deliveries",
    textUrdu: "فوری ڈیلیوری کے لیے ایمرجنسی بٹن استعمال کریں"
  },
  {
    text: "Refer friends to get delivery discounts",
    textUrdu: "ڈیلیوری کی رعایت حاصل کرنے کے لیے دوستوں کو حوالہ دیں"
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
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
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  activeLanguage: {
    backgroundColor: '#e91e63',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e91e63',
  },
  activeLanguageText: {
    color: '#fff',
  },
  content: {
    padding: 15,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 25,
    elevation: 8,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#e91e63',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  divider: {
    height: 2,
    width: 100,
    backgroundColor: '#1e88e5',
    marginVertical: 15,
    alignSelf: 'center',
    borderRadius: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e91e63',
    marginLeft: 10,
  },
  videoPlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    backgroundColor: 'rgba(30, 136, 229, 0.7)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCaption: {
    fontSize: 14,
    color: '#546e7a',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: '#f5f9ff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e91e63',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#546e7a',
    lineHeight: 20,
  },
  tipsContainer: {
    marginTop: 10,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: '#f5f9ff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  tipIcon: {
    backgroundColor: '#e3f2fd',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    fontSize: 15,
    color: '#4a5568',
    flex: 1,
    lineHeight: 22,
  },
  supportSection: {
    backgroundColor: '#f5f9ff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#e91e63',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});