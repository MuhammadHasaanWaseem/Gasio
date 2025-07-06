import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageProps,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  onDone: () => void;
}

// Animated fade-in image component
const AnimatedImage: React.FC<ImageProps> = (props) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  return <Animated.Image {...props} style={[props.style, { opacity }]} />;
};

// Unified red button style
const RedButton = ({ label, onPress }: { label: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const CustomDoneButton = ({ onPress }: { onPress: () => void }) => (
  <RedButton label="Get Started" onPress={onPress} />
);
const CustomSkipButton = ({ ...props }) => (
  <TouchableOpacity style={styles.button} {...props}>
    <Text style={styles.buttonText}>Skip</Text>
  </TouchableOpacity>
);
const CustomNextButton = ({ ...props }) => (
  <TouchableOpacity style={styles.button} {...props}>
    <Text style={styles.buttonText}>Next</Text>
  </TouchableOpacity>
);

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDone }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalPages = 3;

  const handleDone = async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    onDone();
  };

  useEffect(() => {
    if (currentIndex === totalPages - 1) {
      const timer = setTimeout(() => {
        handleDone();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar hidden />
      <Onboarding
        onSkip={handleDone}
        onDone={handleDone}
        // @ts-ignore - onPageChange works but is not typed in the lib
        onPageChange={(index:number) => setCurrentIndex(index)}
        bottomBarHighlight={false}
        bottomBarColor="#fff"
        SkipButtonComponent={CustomSkipButton}
        NextButtonComponent={CustomNextButton}
        DoneButtonComponent={CustomDoneButton}
        DotComponent={({ selected }) => (
          <Text
            style={{
              fontSize: 30,
              color: selected ? '#ed3237' : '#ccc',
              marginHorizontal: 3,
            }}
          >
            •
          </Text>
        )}
        pages={[
          {
            backgroundColor: '#fff',
            image: (
              <AnimatedImage
                source={require('../assets/images/Gasio.png')}
                style={styles.image}
              />
            ),
            title: 'Welcome to Gasio',
            subtitle: 'Your journey to better gas management starts here.',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#fff',
            image: (
              <AnimatedImage
                source={require('../assets/images/vendor.png')}
                style={styles.imageLarge}
              />
            ),
            title: 'Track Your Usage',
            subtitle: 'Monitor your gas consumption easily and efficiently.',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#fff',
            image: (
              <AnimatedImage
                source={require('../assets/images/save.png')}
                style={styles.imageLarge}
              />
            ),
            title: 'Save Money',
            subtitle: 'Get tips and alerts to save on your gas bills.',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
        ]}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  imageLarge: {
    width: 400,
    height: 500,
    resizeMode: 'contain',
    marginBottom: 40,
    borderRadius: 19,
  },
  title: {
    color: '#000',
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#555',
    fontSize: 16,
    marginTop: 16,
    paddingHorizontal: 40,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ed3237',
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
