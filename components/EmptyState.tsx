import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Film, Plus } from 'lucide-react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function EmptyState({
  title = 'Chưa có video',
  message = 'Import video đầu tiên để bắt đầu xem',
  onAction,
  actionLabel = 'Import Video',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Film size={48} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
          <Plus size={18} color={Colors.text} />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
