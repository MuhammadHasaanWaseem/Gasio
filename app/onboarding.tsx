import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import OnboardingSwiper from 'react-native-onboarding-swiper';

const Onboarding = () => {

  const onDone = () => {
    router.push('/(auth)/login'); // Adjust the path to your actual home or main tab route
  };

  const onSkip = () => {
    router.push('/(auth)/login');
  };

  const SkipButton = ({ ...props }) => (
    <TouchableOpacity style={styles.button} {...props}>
      <Text style={styles.buttonText}>Skip</Text>
    </TouchableOpacity>
  );

  const NextButton = ({ ...props }) => (
    <TouchableOpacity style={styles.button} {...props}>
      <Text style={styles.buttonText}>Next</Text>
    </TouchableOpacity>
  );

  const DoneButton = ({ ...props }) => (
    <TouchableOpacity style={styles.button} {...props}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  );

  return (
    <OnboardingSwiper
      onSkip={onSkip}
      onDone={onDone}
      SkipButtonComponent={SkipButton}
      NextButtonComponent={NextButton}
      DoneButtonComponent={DoneButton}
      containerStyles={{ backgroundColor: '#fff' }}
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
            <Image
              source={require('../assets/images/Gasio.png')}
              style={{ width: 400, height: 400, resizeMode: 'contain' }}
            />
          ),
          title: 'Welcome to Gasio',
          subtitle: 'Your journey to better gas management starts here.',
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              source={require('../assets/images/vendor.png')}
              style={{ width: 400, height: 550, resizeMode: 'contain' }}
            />
          ),
          title: 'Track Your Usage',
          subtitle: 'Monitor your gas consumption easily and efficiently.',
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              source={require('../assets/images/save.png')}
              style={{ width: 450, height: 500, resizeMode: 'contain',borderRadius:19 }}
            />
          ),
          title: 'Save Money',
          subtitle: 'Get tips and alerts to save on your gas bills.',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
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
  dotStyle: {
    backgroundColor: '#ed3237',
  },
  inactiveDotStyle: {
    backgroundColor: '#ccc',
  },
});

export default Onboarding;
