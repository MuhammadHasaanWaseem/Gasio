import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, HelpCircle, Mail, MapPin, MessageCircle, Phone } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ContactSupportScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
     // router.push({ pathname: '/support/confirmation', params: { name } });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* 3D Header with Gradient */}
      <Animated.View entering={FadeIn.duration(500)}>
        <LinearGradient
          colors={['#e91e63', '#ff5252']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contact Support</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.header3DEffect} />
        </LinearGradient>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.card}>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
            We're Here to Help
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(300)} style={styles.subtitle}>
            Reach out to us through any of these channels
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.divider} />

          {/* Contact Options */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.contactOptions}>
            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.optionIcon}>
                <Mail size={24} color="#e91e63" />
              </View>
              <View style={styles.optionDetails}>
                <Text style={styles.optionTitle}>Email Support</Text>
                <Text style={styles.optionText}>support@gasio.com</Text>
                <Text style={styles.optionSubtext}>Typically responds within 1 hour</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.optionIcon}>
                <Phone size={24} color="#e91e63" />
              </View>
              <View style={styles.optionDetails}>
                <Text style={styles.optionTitle}>Phone Support</Text>
                <Text style={styles.optionText}>+1 (800) GAS-IO-APP</Text>
                <Text style={styles.optionSubtext}>Available 24/7 for urgent issues</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.optionIcon}>
                <MessageCircle size={24} color="#e91e63" />
              </View>
              <View style={styles.optionDetails}>
                <Text style={styles.optionTitle}>Live Chat</Text>
                <Text style={styles.optionText}>Available in the app</Text>
                <Text style={styles.optionSubtext}>Connect instantly with an agent</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

       
          {/* FAQ Section */}
          <Animated.View entering={FadeInUp.delay(1200)} style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {faqs.map((faq, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(1300 + index * 100).springify()}
                style={styles.faqItem}
              >
                <View style={styles.faqHeader}>
                  <HelpCircle size={20} color="#e91e63" />
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Office Location */}
          <Animated.View entering={FadeInUp.delay(1700)} style={styles.officeSection}>
            <Text style={styles.sectionTitle}>Visit Our Office</Text>
            
            <View style={styles.officeCard}>
              <View style={styles.officeIcon}>
                <MapPin size={28} color="#e91e63" />
              </View>
              <View style={styles.officeDetails}>
                <Text style={styles.officeName}>Gasio Headquarters</Text>
                <Text style={styles.officeAddress}>123 Energy Avenue</Text>
                <Text style={styles.officeAddress}>Lahore Pakistan, 54000</Text>
                <Text style={styles.officeHours}>Mon-Fri: 9:00 AM - 6:00 PM</Text>
              </View>
            </View>
            
          
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const faqs = [
  {
    question: "How quickly can I expect a response?",
    answer: "Our support team typically responds within 1 hour during business hours (9 AM - 6 PM PST). For urgent issues, please call our 24/7 support line."
  },
  {
    question: "What information should I include in my support request?",
    answer: "Please include your account email, order number (if applicable), and a detailed description of your issue. Screenshots are also helpful!"
  },
  {
    question: "Do you offer support in multiple languages?",
    answer: "Yes! We currently offer support in English, Spanish, French, and Arabic. Our live chat agents are available in all these languages."
  },
  {
    question: "Can I schedule a callback?",
    answer: "Absolutely! If you submit a request after hours, you can choose a preferred callback time in the form above."
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
    shadowColor: '#d81b60',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    zIndex: 10,
    overflow: 'hidden',
  },
  header3DEffect: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 25,
    backgroundColor: '#d81b60',
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
  content: {
    padding: 15,
    paddingTop: 25,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 25,
    elevation: 8,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    marginBottom: 20,
    transform: [{ translateY: -10 }],
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
    backgroundColor: '#e91e63',
    marginVertical: 15,
    alignSelf: 'center',
    borderRadius: 2,
  },
  contactOptions: {
    marginBottom: 25,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fce4e8',
  },
  optionIcon: {
    backgroundColor: '#fce4e8',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e91e63',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 15,
    color: '#4a5568',
    marginBottom: 2,
  },
  optionSubtext: {
    fontSize: 13,
    color: '#718096',
    fontStyle: 'italic',
  },
  formContainer: {
    marginBottom: 25,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1a202c',
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#e91e63',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  faqSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 20,
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: '#fdf2f5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fce4e8',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e91e63',
    marginLeft: 10,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#4a5568',
    lineHeight: 22,
  },
  officeSection: {
    marginBottom: 10,
  },
  officeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fce4e8',
  },
  officeIcon: {
    backgroundColor: '#fce4e8',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  officeDetails: {
    flex: 1,
  },
  officeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e91e63',
    marginBottom: 5,
  },
  officeAddress: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 2,
  },
  officeHours: {
    fontSize: 14,
    color: '#718096',
    marginTop: 5,
    fontStyle: 'italic',
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});