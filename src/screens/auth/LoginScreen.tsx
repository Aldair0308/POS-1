import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { loginUser } from '../../services/storage';
import { User } from '../../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = useCallback(async (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      setLoading(true);
      try {
        const user = await loginUser(newPin);
        if (user) {
          onLogin(user);
        } else {
          setError('PIN incorrecto');
          shake();
          setTimeout(() => setPin(''), 400);
        }
      } catch (e) {
        setError('Error al iniciar sesión');
        setPin('');
      } finally {
        setLoading(false);
      }
    }
  }, [pin, onLogin]);

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        index < pin.length && styles.dotFilled,
        error ? styles.dotError : null,
      ]}
    />
  );

  const renderKey = (digit: string) => (
    <TouchableOpacity
      key={digit}
      style={styles.key}
      onPress={() => handlePress(digit)}
      activeOpacity={0.6}
    >
      <Text style={styles.keyText}>{digit}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Logo area */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🍽️</Text>
        </View>
        <Text style={styles.appName}>RestoMX</Text>
        <Text style={styles.subtitle}>Sistema de Gestión</Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.pinSection}>
        <Text style={styles.pinLabel}>Ingresa tu PIN</Text>
        <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3].map(renderDot)}
        </Animated.View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        <View style={styles.keyRow}>
          {['1', '2', '3'].map(renderKey)}
        </View>
        <View style={styles.keyRow}>
          {['4', '5', '6'].map(renderKey)}
        </View>
        <View style={styles.keyRow}>
          {['7', '8', '9'].map(renderKey)}
        </View>
        <View style={styles.keyRow}>
          <View style={styles.key} />
          {renderKey('0')}
          <TouchableOpacity style={styles.key} onPress={handleDelete} activeOpacity={0.6}>
            <Text style={styles.deleteText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintTitle}>PINs de demo:</Text>
        <Text style={styles.hintText}>Admin: 1234 · Mesero: 5678</Text>
        <Text style={styles.hintText}>Cocina: 9012 · Barra: 3456</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.glow(Colors.primary),
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  pinSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pinLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  keypad: {
    gap: 12,
    marginBottom: 24,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  keyText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '600',
  },
  deleteText: {
    color: Colors.textSecondary,
    fontSize: 24,
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primaryBg,
  },
  hintTitle: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
