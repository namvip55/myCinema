import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  Plus,
  Grid3x3,
  List,
  SortAsc,
  Heart,
} from 'lucide-react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useVideoStore } from '../../store/videoStore';
import { copyVideoToAppStorage, deleteVideoFromStorage } from '../../utils/fileManager';
import { getDefaultHighlights } from '../../constants/highlights';
import type { VideoItem, SortOption } from '../../constants/types';
import VideoCard from '../../components/VideoCard';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'dateAdded', label: 'Mới nhất' },
  { key: 'name', label: 'Tên A-Z' },
  { key: 'size', label: 'Kích thước' },
  { key: 'lastPlayed', label: 'Xem gần đây' },
];

import * as MediaLibrary from 'expo-media-library';

export default function LibraryScreen() {
  const router = useRouter();
  const {
    videos,
    searchQuery,
    sortBy,
    viewMode,
    addVideo,
    removeVideo,
    toggleFavorite,
    setSearchQuery,
    setSortBy,
    setViewMode,
    getFilteredVideos,
    getContinueWatching,
  } = useVideoStore();

  const [sortVisible, setSortVisible] = useState(false);

  const filteredVideos = getFilteredVideos();
  const continueWatching = getContinueWatching();

  const handlePlusPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert('Thêm video', 'Chọn nguồn video', [
      {
        text: 'Thư viện ảnh (Gallery)',
        onPress: () => pickFromGallery(),
      },
      {
        text: 'Chọn từ tệp (Files)',
        onPress: () => pickFromFiles(),
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const pickFromGallery = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện để tiếp tục.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const name = asset.uri.split('/').pop() || `video_${Date.now()}.mp4`;
        
        Alert.alert('Tùy chọn lưu trữ', 'Bạn muốn lưu video này như thế nào?', [
          {
            text: 'Tiết kiệm bộ nhớ (Chỉ lưu link)',
            onPress: () => handleVideoSelected(asset.uri, name, asset.fileSize || 0, false),
          },
          {
            text: 'Sao lưu vào app (An toàn hơn)',
            onPress: () => handleVideoSelected(asset.uri, name, asset.fileSize || 0, true),
          },
        ]);
      }
    } catch (e) {
      console.error('Pick error:', e);
    }
  };

  const pickFromFiles = async () => {
    // Luôn copy khi chọn từ Files vì file temp có thể bị xóa
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 1,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const name = asset.fileName || asset.uri.split('/').pop() || 'video.mp4';
        handleVideoSelected(asset.uri, name, asset.fileSize || 0, true);
      }
    } catch (e) {
      console.error('File pick error:', e);
    }
  };

  const handleVideoSelected = useCallback(
    async (uri: string, name: string, size: number, shouldCopy: boolean) => {
      try {
        let finalUri: string | null = uri;
        if (shouldCopy) {
          finalUri = await copyVideoToAppStorage(uri, name);
        }
        
        if (!finalUri) {
          throw new Error('Could not obtain a valid file URI');
        }

        const highlights = getDefaultHighlights(name);

        const video: VideoItem = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          title: name.replace(/\.[^.]+$/, ''),
          uri: finalUri,
          duration: 0, // will be set by player
          size,
          addedAt: Date.now(),
          favorite: false,
          highlights,
        };

        addVideo(video);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Lỗi', 'Không thể import video. Vui lòng thử lại.');
        console.error('Import error:', error);
      }
    },
    [addVideo]
  );

  const handlePlay = useCallback(
    (video: VideoItem) => {
      router.push({
        pathname: '/player',
        params: { videoId: video.id },
      });
    },
    [router]
  );

  const handleLongPress = useCallback(
    (video: VideoItem) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(video.title, '', [
        {
          text: video.favorite ? 'Bỏ yêu thích' : '❤️ Yêu thích',
          onPress: () => {
            toggleFavorite(video.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
        {
          text: '🗑️ Xóa video',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Xóa video?', `Xóa "${video.title}" khỏi thư viện?`, [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  await deleteVideoFromStorage(video.uri);
                  removeVideo(video.id);
                },
              },
            ]);
          },
        },
        { text: 'Đóng', style: 'cancel' },
      ]);
    },
    [toggleFavorite, removeVideo]
  );

  const renderContinueWatching = () => {
    if (continueWatching.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>▶ Tiếp tục xem</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.continueRow}>
            {continueWatching.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.continueCard}
                onPress={() => handlePlay(video)}
                activeOpacity={0.7}
              >
                <View style={styles.continueThumbnail}>
                  <Text style={styles.continuePlayIcon}>▶</Text>
                  <View style={styles.continueProgress}>
                    <View
                      style={[
                        styles.continueProgressFill,
                        {
                          width: `${
                            ((video.lastPosition || 0) / video.duration) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.continueTitle} numberOfLines={1}>
                  {video.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎬 MyCinema</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List size={22} color={Colors.textSecondary} />
            ) : (
              <Grid3x3 size={22} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortVisible(!sortVisible)}>
            <SortAsc size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Sort pills */}
      {sortVisible && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortRow}
          contentContainerStyle={styles.sortRowContent}
        >
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.sortPill,
                sortBy === opt.key && styles.sortPillActive,
              ]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text
                style={[
                  styles.sortPillText,
                  sortBy === opt.key && styles.sortPillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      {videos.length === 0 ? (
        <EmptyState onAction={handlePlusPress} />
      ) : (
        <FlatList
          data={filteredVideos}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.list}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          ListHeaderComponent={renderContinueWatching}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              viewMode={viewMode}
              onPress={() => handlePlay(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handlePlusPress}
        activeOpacity={0.8}
      >
        <Plus size={28} color={Colors.text} />
      </TouchableOpacity>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  logo: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sortRow: {
    maxHeight: 40,
    marginBottom: Spacing.md,
  },
  sortRowContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sortPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  sortPillActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  sortPillText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  sortPillTextActive: {
    color: Colors.primary,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
  },

  // Continue watching
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  continueRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  continueCard: {
    width: 140,
  },
  continueThumbnail: {
    width: 140,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  continuePlayIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  continueProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  continueTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
