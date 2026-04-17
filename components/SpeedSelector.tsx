import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { SPEED_OPTIONS, type SpeedOption } from '../constants/types';

interface SpeedSelectorProps {
  visible: boolean;
  currentSpeed: number;
  onSelect: (speed: SpeedOption) => void;
  onClose: () => void;
}

export default function SpeedSelector({
  visible,
  currentSpeed,
  onSelect,
  onClose,
}: SpeedSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Tốc độ phát</Text>

          <View style={styles.grid}>
            {SPEED_OPTIONS.map((speed) => {
              const isActive = currentSpeed === speed;
              return (
                <TouchableOpacity
                  key={speed}
                  style={[styles.speedBtn, isActive && styles.speedBtnActive]}
                  onPress={() => {
                    onSelect(speed);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.speedText,
                      isActive && styles.speedTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                  {speed === 1 && (
                    <Text style={styles.normalLabel}>Bình thường</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  speedBtn: {
    width: 76,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  speedBtnActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  speedText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  speedTextActive: {
    color: Colors.primary,
  },
  normalLabel: {
    fontSize: 8,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
