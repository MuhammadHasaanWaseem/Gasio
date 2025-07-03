import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Banknote,
    Check,
    ChevronDown,
    CreditCard,
    Smartphone,
    X
} from 'lucide-react-native';
import React, { JSX, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const paymentMethodsOptions = [
  "Jazzcash",
  "Easypaisa",
  "Naya Pay",
  "Bank Transfer",
  "Cash on Delivery"
] as const;

type PaymentMethod = typeof paymentMethodsOptions[number];

const paymentIcons: Record<PaymentMethod, JSX.Element> = {
  "Jazzcash": <Smartphone size={24} color="#8A2BE2" />,
  "Easypaisa": <Smartphone size={24} color="#0066B3" />,
  "Naya Pay": <Smartphone size={24} color="#FF6B00" />,
  "Bank Transfer": <CreditCard size={24} color="#2E8B57" />,
  "Cash on Delivery": <Banknote size={24} color="#DAA520" />,
};

export default function PaymentMethodsSelector({ selectedMethods, onSelectionChange }:any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMethod = (method: PaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let newSelectedMethods = [...selectedMethods];
    if (newSelectedMethods.includes(method)) {
      newSelectedMethods = newSelectedMethods.filter(m => m !== method);
    } else {
      newSelectedMethods.push(method);
    }
    onSelectionChange(newSelectedMethods);
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(animation, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const modalTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const modalOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={openModal}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#f9f9f9', '#ffffff']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.buttonContent}>
            {selectedMethods.length > 0 ? (
              <View style={styles.selectedMethodsContainer}>
                <Text style={styles.buttonText}>
                  {selectedMethods.join(', ')}
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, styles.placeholderText]}>
                Select Payment Methods
              </Text>
            )}
            <ChevronDown size={20} color="#666" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalTranslateY }] }]}>
              <LinearGradient
                colors={['#f8f9fa', '#e9ecef']}
                style={styles.modalHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modalTitle}>Select Payment Methods</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView style={styles.methodsContainer}>
                {paymentMethodsOptions.map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodItem,
                      selectedMethods.includes(method) && styles.methodItemSelected
                    ]}
                    onPress={() => toggleMethod(method)}
                  >
                    <View style={styles.methodInfo}>
                      {paymentIcons[method]}
                      <Text style={styles.methodText}>{method}</Text>
                    </View>
                    {selectedMethods.includes(method) && (
                      <View style={styles.checkmark}>
                        <Check size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.confirmButton} onPress={closeModal}>
                <LinearGradient
                  colors={['#ed3237', '#ff5f6d']}
                  style={styles.confirmButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.confirmButtonText}>Confirm Selection</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonGradient: {
    padding: 18,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  placeholderText: {
    color: '#888',
  },
  selectedMethodsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 30,
    maxHeight: '80%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  methodsContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  methodItemSelected: {
    borderColor: '#ed3237',
    backgroundColor: '#fff5f5',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ed3237',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#ed3237',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  confirmButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
