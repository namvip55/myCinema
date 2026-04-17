import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import {
  ENHANCEMENT_PRESETS,
  type VideoEnhancement,
  type EnhancementPreset,
} from '../constants/types';

interface EnhancementPanelProps {
  visible: boolean;
  enhancement: VideoEnhancement;
  onUpdate: (e: Partial<VideoEnhancement>) => void;
  onPreset: (preset: EnhancementPreset) => void;
  onReset: () => void;
  onClose: () => void;
}

const PRESETS: { key: EnhancementPreset; label: string; emoji: string }[] = [
  { key: 'default', label: 'Mặc định', emoji: '🔄' },
  { key: 'sharp', label: 'Sắc nét', emoji: '🔍' },
  { key: 'vivid', label: 'Sống động', emoji: '🌈' },
  { key: 'cinema', label: 'Cinema', emoji: '🎬' },
];

export default function EnhancementPanel({
  visible,
  enhancement,
  onUpdate,
  onPreset,
  onReset,
  onClose,
}: EnhancementPanelProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>Chỉnh chất lượng hình ảnh</Text>

          {/* Presets */}
          <View style={styles.presets}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={styles.presetBtn}
                onPress={() => onPreset(p.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetEmoji}>{p.emoji}</Text>
                <Text style={styles.presetLabel}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sliders */}
          <View style={styles.sliders}>
            <SliderRow
              label="Độ sáng"
              value={enhancement.brightness}
              onValueChange={(v) => onUpdate({ brightness: v })}
            />
            <SliderRow
              label="Độ tương phản"
              value={enhancement.contrast}
              onValueChange={(v) => onUpdate({ contrast: v })}
            />
            <SliderRow
              label="Độ bão hòa"
              value={enhancement.saturation}
              onValueChange={(v) => onUpdate({ saturation: v })}
            />
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
            <Text style={styles.resetText}>Đặt lại mặc định</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function SliderRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
}) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{Math.round(value)}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={-100}
        maximumValue={100}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={Colors.primaryLight}
        step={1}
      />
    </View>
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
  presets: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sliders: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  sliderRow: {
    gap: Spacing.xs,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 32,
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  resetText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
