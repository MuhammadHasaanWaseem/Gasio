import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, RefreshCw, Shield, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function AboutScreen() {
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About Gasio</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.header3DEffect} />
        </LinearGradient>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.card}>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
            Revolutionizing Gas Delivery
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(300)} style={styles.subtitle}>
            Connecting you to the nearest gas providers with just a tap
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.divider} />

          <Animated.View entering={FadeInUp.delay(500)} style={styles.featureSection}>
            <Text style={styles.sectionTitle}>Why Choose Gasio?</Text>
            <Text style={styles.text}>
              Gasio is your one-stop solution for all your gas refill and delivery needs. 
              Whether you need a cylinder for your home, camping trip, or business, we make 
              the process simple, fast, and reliable.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600)} style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(700 + index * 100).springify()}
                style={styles.featureCard}
              >
                <View style={styles.iconContainer}>
                  {feature.icon}
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(1200)} style={styles.featureSection}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            {steps.map((step, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(1300 + index * 100).springify()}
                style={styles.stepContainer}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(1700)} style={styles.featureSection}>
            <Text style={styles.sectionTitle}>Our App Ecosystem</Text>
            
            <View style={styles.appsContainer}>
              {apps.map((app, index) => (
                <Animated.View 
                  key={index} 
                  entering={FadeInUp.delay(1800 + index * 100).springify()}
                  style={styles.appCard}
                >
                  <View style={styles.appIcon}>
                    <Image source={require('../../../assets/images/Gasio.png')}/>
                  </View>
                  <Text style={styles.appTitle}>{app.name}</Text>
                  <Text style={styles.appDescription}>{app.description}</Text>
                  <Text style={styles.appRegion}>{app.region}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(2200)} style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            <Text style={styles.contactText}>
              Have questions or feedback? We'd love to hear from you!
            </Text>
            <Text style={styles.contactInfo}>
              Email: support@gasio.com
            </Text>
            <Text style={styles.contactInfo}>
              Phone: +1 (800) GAS-IO-APP
            </Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const features = [
  {
    icon: <Zap size={28} color="#e91e63" />,
    title: "Lightning Fast Delivery",
    text: "Get your gas delivered in under 60 minutes"
  },
  {
    icon: <MapPin size={28} color="#e91e63" />,
    title: "Real-time Tracking",
    text: "Follow your delivery driver in real-time"
  },
  {
    icon: <RefreshCw size={28} color="#e91e63" />,
    title: "Auto Refill",
    text: "Never run out with smart refill scheduling"
  },
  {
    icon: <Shield size={28} color="#e91e63" />,
    title: "Secure Payments",
    text: "Safe and encrypted payment processing"
  }
];

const steps = [
  {
    title: "Find Nearby Providers",
    description: "Use our map to locate gas providers in your area"
  },
  {
    title: "Place Your Order",
    description: "Select your gas type and quantity with a few taps"
  },
  {
    title: "Track Your Delivery",
    description: "Follow your driver in real-time on the map"
  },
  {
    title: "Enjoy Your Gas",
    description: "Receive your delivery and confirm on the app"
  }
];

const apps = [
  {
    name: "Gas Finder",
    description: "Find nearest refill/swap locations with user-updated prices",
    region: "Australia",
   // icon: <Image source={require('./assets/gasfinder.png')} style={styles.appImage} />
  },
  {
    name: "Gasable",
    description: "Sustainable energy marketplace with AI logistics",
    region: "International",
   // icon: <Image source={require('./assets/gasable.png')} style={styles.appImage} />
  },
  {
    name: "EzFill",
    description: "On-demand fuel delivery for your vehicle",
    region: "USA",
   // icon: <Image source={require('./assets/ezfill.png')} style={styles.appImage} />
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
    backgroundColor: '#1e88e5',
    marginVertical: 15,
    alignSelf: 'center',
    borderRadius: 2,
  },
  featureSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1a237e',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f5f9ff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  iconContainer: {
    backgroundColor: '#e3f2fd',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e91e63',
    marginBottom: 5,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 13,
    color: '#546e7a',
    textAlign: 'center',
    lineHeight: 18,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#546e7a',
    lineHeight: 20,
  },
  appsContainer: {
    marginTop: 10,
  },
  appCard: {
    backgroundColor: '#f5f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  appIcon: {
    alignItems: 'center',
    marginBottom: 15,
  },
  appImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e91e63',
    textAlign: 'center',
    marginBottom: 5,
  },
  appDescription: {
    fontSize: 14,
    color: '#546e7a',
    textAlign: 'center',
    marginBottom: 5,
    lineHeight: 20,
  },
  appRegion: {
    fontSize: 13,
    color: '#78909c',
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: '#e3f2fd',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 5,
  },
  contactSection: {
    marginTop: 10,
    backgroundColor: '#f5f9ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  contactText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  contactInfo: {
    fontSize: 16,
    color: '#1e88e5',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
});