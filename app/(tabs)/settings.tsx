import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  Lock,
  HardDrive,
  Film,
  Trash2,
  Info,
  ChevronRight,
  Fingerprint,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useVideoStore } from '../../store/videoStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { getTotalStorageUsed, formatFileSize } from '../../utils/fileManager';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function SettingsScreen() {
  const { resetPin, isBiometricsEnabled, setBiometricsEnabled } = useAuthStore();
  const { videos } = useVideoStore();
  const { playlists } = usePlaylistStore();
  const [storageUsed, setStorageUsed] = useState(0);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    getTotalStorageUsed().then(setStorageUsed);
    
    // Kiểm tra hỗ trợ sinh trắc học
    LocalAuthentication.hasHardwareAsync().then(hasHardware => {
      LocalAuthentication.isEnrolledAsync().then(isEnrolled => {
        setIsBiometricSupported(hasHardware && isEnrolled);
      });
    });
  }, [videos.length]);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      // Xác thực thử trước khi bật
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực để bật sinh trắc học',
      });
      if (result.success) {
        setBiometricsEnabled(true);
        Alert.alert('Thành công', 'Đã bật mở khóa bằng sinh trắc học.');
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  const handleChangePin = () => {
    Alert.alert('Đổi PIN', 'Bạn sẽ phải tạo PIN mới. Tiếp tục?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đổi PIN',
        onPress: () => resetPin(),
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(
      '⚠️ Xóa tất cả dữ liệu',
      'Tất cả video, playlist và cài đặt sẽ bị xóa. Không thể hoàn tác!',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Đã xóa', 'Khởi động lại app để hoàn tất.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>⚙️ Cài đặt</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Film size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{videos.length}</Text>
            <Text style={styles.statLabel}>Video</Text>
          </View>
          <View style={styles.statCard}>
            <HardDrive size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{formatFileSize(storageUsed)}</Text>
            <Text style={styles.statLabel}>Dung lượng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📋</Text>
            <Text style={styles.statValue}>{playlists.length}</Text>
            <Text style={styles.statLabel}>Playlist</Text>
          </View>
        </View>

        {/* Security */}
        <Text style={styles.sectionTitle}>Bảo mật</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleChangePin}>
          <Lock size={20} color={Colors.primary} />
          <Text style={styles.menuText}>Đổi PIN</Text>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {isBiometricSupported && (
          <View style={styles.menuItem}>
            <Fingerprint size={20} color={Colors.primary} />
            <Text style={styles.menuText}>Mở khóa bằng khuôn mặt/vân tay</Text>
            <Switch
              value={isBiometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: Colors.bgElevated, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        )}

        {/* Data */}
        <Text style={styles.sectionTitle}>Dữ liệu</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleClearAll}
        >
          <Trash2 size={20} color={Colors.danger} />
          <Text style={[styles.menuText, { color: Colors.danger }]}>
            Xóa tất cả dữ liệu
          </Text>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* About */}
        <Text style={styles.sectionTitle}>Thông tin</Text>
        <View style={styles.menuItem}>
          <Info size={20} color={Colors.textSecondary} />
          <View style={styles.aboutInfo}>
            <Text style={styles.menuText}>MyCinema</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Made with ❤️ for offline video watching
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.card,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  menuText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  aboutInfo: {
    flex: 1,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footer: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },
});
