import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, Layout, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default ()=> {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState(Array(12).fill(false));

  const toggleSection = (index:any) => {
    const newExpanded = [...expandedSections];
    newExpanded[index] = !newExpanded[index];
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      title: "1. Introduction",
      content: "Welcome to Gasio, a platform connecting customers with verified gas vendors for safe and reliable gas delivery services. By accessing or using our services, you agree to comply with these Terms of Use."
    },
    {
      title: "2. User Agreement",
      content: "Users must provide accurate information and use the platform responsibly. Any misuse, fraudulent activity, or violation of these terms may result in suspension or termination of your account."
    },
    {
      title: "3. Vendor Guidelines",
      content: "Vendors are required to provide valid documentation, maintain quality standards, and deliver services promptly. Failure to comply may lead to removal from the platform."
    },
    {
      title: "4. Payments",
      content: "Gasio supports payments via Stripe and Cash on Delivery (COD). We are not responsible for third-party payment failures or disputes between customers and vendors."
    },
    {
      title: "5. Privacy Policy",
      content: "We respect your privacy and handle your personal data in accordance with our Privacy Policy. By using Gasio, you consent to the collection and use of your information as described therein."
    },
    {
      title: "6. User Responsibilities",
      content: "Users must ensure the safety of their delivery locations and provide accurate delivery instructions. Gasio is not liable for damages or losses resulting from user negligence."
    },
    {
      title: "7. Vendor Responsibilities",
      content: "Vendors must comply with all applicable laws and regulations, maintain valid licenses, and ensure the safety and quality of their services."
    },
    {
      title: "8. Dispute Resolution",
      content: "Any disputes between users and vendors should be resolved amicably. Gasio may assist but is not responsible for resolving disputes or compensating losses."
    },
    {
      title: "9. Limitation of Liability",
      content: "Gasio is not liable for delays, damages, or losses caused by external factors such as traffic, weather, or third-party actions."
    },
    {
      title: "10. Termination",
      content: "Gasio reserves the right to suspend or terminate accounts for violations of these terms or for any reason deemed necessary."
    },
    {
      title: "11. Changes to Terms",
      content: "We may update these Terms of Use from time to time. Continued use of the platform constitutes acceptance of the updated terms."
    },
    {
      title: "12. Contact Us",
      content: "For questions or concerns regarding these terms, please contact our support team."
    }
  ];

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
            <Text style={styles.headerTitle}>Terms of Use</Text>
            <View style={{ width: 28 }} />
          </View>
          
          {/* 3D effect element */}
          <View style={styles.header3DEffect} />
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInUp.delay(200).springify()} 
          style={styles.card}
        >
          <Animated.Text 
            entering={FadeInUp.delay(300).springify()}
            style={styles.title}
          >
            Terms of Use for <Text style={styles.appName}>Gasio</Text>
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeInUp.delay(400).springify()}
            style={styles.subtitle}
          >
            Last Updated: July 3, 2025
          </Animated.Text>
          
          <Animated.View 
            entering={FadeInUp.delay(500).springify()}
            style={styles.divider}
          />
          
          <View style={styles.sectionsContainer}>
            {sections.map((section, index) => (
              <Animated.View 
                key={index}
                layout={Layout.springify()}
                style={styles.sectionContainer}
                entering={SlideInUp.delay(100 + index * 50)}
              >
                <TouchableOpacity 
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(index)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={expandedSections[index] ? ['#f5f7fa', '#e4e7f2'] : ['#ffffff', '#f8f9fc']}
                    style={styles.sectionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {expandedSections[index] ? (
                      <ChevronUp color="#6c757d" size={20} />
                    ) : (
                      <ChevronDown color="#6c757d" size={20} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                {expandedSections[index] && (
                  <Animated.View 
                    entering={FadeIn.duration(300)}
                    exiting={FadeIn.duration(200)}
                    style={styles.sectionContent}
                  >
                    <Text style={styles.sectionText}>{section.content}</Text>
                  </Animated.View>
                )}
              </Animated.View>
            ))}
          </View>
          
          <Animated.View 
            entering={FadeInUp.delay(600).springify()}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              By using Gasio, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
            </Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f2f5' 
  },
  header: {
    paddingTop: 55,
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
    zIndex: 2,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5
  },
  content: { 
    padding: 15,
    paddingTop: 25,
    paddingBottom: 40 
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
  sectionsContainer: {
    marginTop: 10,
  },
  sectionContainer: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    borderRadius: 12,
  },
  sectionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4a5568',
    letterSpacing: 0.3,
    flex: 1,
  },
  sectionContent: {
    backgroundColor: '#f9fafc',
    padding: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#4a5568',
    lineHeight: 22,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#e91e63',
  },
  footerText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});