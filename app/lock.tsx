import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import PinPad from '../components/PinPad';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';

export default function LockScreen() {
  const { isFirstTime, setPin, verifyPin, isBiometricsEnabled, unlock } = useAuthStore();
  const [error, setError] = useState(false);
  const [step, setStep] = useState<'create' | 'confirm' | 'unlock'>(
    isFirstTime ? 'create' : 'unlock'
  );
  const [tempPin, setTempPin] = useState('');
  const router = useRouter();

  const handleBiometricAuth = useCallback(async () => {
    if (!isBiometricsEnabled || step !== 'unlock') return;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Xác thực để mở khóa MyCinema',
          fallbackLabel: 'Sử dụng mã PIN',
          disableDeviceFallback: false,
        });

        if (result.success) {
          unlock();
          router.replace('/(tabs)');
        }
      }
    } catch (e) {
      console.error('Biometric error:', e);
    }
  }, [isBiometricsEnabled, step, unlock, router]);

  useEffect(() => {
    if (step === 'unlock' && isBiometricsEnabled) {
      // Đợi UI render xong rồi mới hiện prompt
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, isBiometricsEnabled, handleBiometricAuth]);

  const handleUnlock = useCallback(async (pin: string) => {
    const valid = await verifyPin(pin);
    if (valid) {
      router.replace('/(tabs)');
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  }, [verifyPin, router]);

  const handleCreate = useCallback((pin: string) => {
    setTempPin(pin);
    setStep('confirm');
  }, []);

  const handleConfirm = useCallback(async (pin: string) => {
    if (pin === tempPin) {
      await setPin(pin);
      router.replace('/(tabs)');
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
        setStep('create');
        setTempPin('');
      }, 600);
    }
  }, [tempPin, setPin, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      {step === 'unlock' && (
        <PinPad
          title="🎬 MyCinema"
          subtitle="Nhập PIN để mở khóa"
          onComplete={handleUnlock}
          error={error}
        />
      )}
      {step === 'create' && (
        <PinPad
          title="Tạo PIN mới"
          subtitle="Nhập 4 số để bảo vệ app"
          onComplete={handleCreate}
          error={error}
        />
      )}
      {step === 'confirm' && (
        <PinPad
          title="Xác nhận PIN"
          subtitle="Nhập lại PIN vừa tạo"
          onComplete={handleConfirm}
          error={error}
        />
      )}

      {step === 'unlock' && isBiometricsEnabled && (
        <TouchableOpacity 
          style={styles.biometricBtn} 
          onPress={handleBiometricAuth}
          activeOpacity={0.7}
        >
          <Fingerprint size={32} color={Colors.primary} />
          <Text style={styles.biometricText}>Sử dụng sinh trắc học</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  biometricBtn: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  biometricText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
