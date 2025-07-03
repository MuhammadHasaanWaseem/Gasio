import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function PrivacyPolicy() {
  const router = useRouter();

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
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.header3DEffect} />
        </LinearGradient>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.card}>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
            Privacy Policy for <Text style={styles.appName}>Gasio</Text>
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(300)} style={styles.subtitle}>
            Last Updated: July 3, 2025
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.divider} />

          {sections.map((section, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(500 + index * 100).springify()}
              style={styles.sectionContainer}
            >
              <Text style={styles.section}>{section.title}</Text>
              <Text style={styles.text}>{section.content}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const sections = [
  {
    title: '1. Introduction',
    content:
      'Gasio is dedicated to safeguarding your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information when you engage with our services.',
  },
  {
    title: '2. Information We Collect',
    content:
      'We gather information you provide, including your name, contact details, and payment information. Additionally, we collect usage data and location information to enhance our services.',
  },
  {
    title: '3. How We Use Your Information',
    content:
      'Your information is utilized to deliver and improve our services, process transactions, communicate with you, and fulfill legal obligations.',
  },
  {
    title: '4. Sharing Your Information',
    content:
      'We do not sell your personal information. We may share it with trusted vendors and service providers to facilitate service delivery.',
  },
  {
    title: '5. Data Security',
    content:
      'We employ robust security measures to protect your data from unauthorized access, alteration, or disclosure.',
  },
  {
    title: '6. Your Rights',
    content:
      'You have the right to access, correct, or delete your personal information. You may also opt out of certain communications.',
  },
  {
    title: '7. Cookies and Tracking',
    content:
      'We use cookies and similar technologies to improve your experience and analyze usage patterns.',
  },
  {
    title: '8. Children\'s Privacy',
    content:
      'Our services are not designed for children under 13. We do not knowingly collect personal information from children.',
  },
  {
    title: '9. Changes to This Policy',
    content:
      'We may periodically update this Privacy Policy. Continued use of our services constitutes acceptance of any changes.',
  },
  {
    title: '10. Contact Us',
    content:
      'For questions or concerns about this Privacy Policy, please contact our support team at support@gasio.com.',
  },
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
    color: '#2d3748',
    lineHeight: 32,
  },
  appName: {
    color: '#e91e63',
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  sectionContainer: {
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: '#f9fafc',
    padding: 16,
    elevation: 2,
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    color: '#4a5568',
    letterSpacing: 0.3,
  },
  text: {
    fontSize: 15,
    color: '#4a5568',
    lineHeight: 22,
    textAlign: 'justify',
  },
});
