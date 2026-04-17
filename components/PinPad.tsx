import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface PinPadProps {
  title: string;
  subtitle?: string;
  onComplete: (pin: string) => void;
  error?: boolean;
}

export default function PinPad({ title, subtitle, onComplete, error }: PinPadProps) {
  const [pin, setPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotScale = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (error) {
      Vibration.vibrate(300);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => setPin(''));
    }
  }, [error]);

  useEffect(() => {
    dotScale.forEach((dot, i) => {
      Animated.spring(dot, {
        toValue: pin.length > i ? 1 : 0,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }).start();
    });

    if (pin.length === 4) {
      setTimeout(() => onComplete(pin), 200);
    }
  }, [pin]);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const renderDots = () => (
    <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
      {[0, 1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              transform: [{ scale: Animated.add(0.6, Animated.multiply(dotScale[i], 0.4)) }],
              backgroundColor: dotScale[i].interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.border, Colors.primary],
              }),
            },
            error && pin.length === 0 && { backgroundColor: Colors.danger },
          ]}
        />
      ))}
    </Animated.View>
  );

  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'DEL'],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {renderDots()}

      <View style={styles.padContainer}>
        {buttons.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((btn) => {
              if (btn === '') {
                return <View key="empty" style={styles.buttonEmpty} />;
              }
              if (btn === 'DEL') {
                return (
                  <TouchableOpacity
                    key="del"
                    style={styles.button}
                    onPress={handleDelete}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.buttonTextSmall}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={btn}
                  style={styles.button}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.buttonText}>{btn}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: 48,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  padContainer: {
    gap: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonEmpty: {
    width: 72,
    height: 72,
  },
  buttonText: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonTextSmall: {
    fontSize: FontSize.xl,
    color: Colors.textSecondary,
  },
});
