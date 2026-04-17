import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Trash2,
  Plus,
  Film,
} from 'lucide-react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import { usePlaylistStore } from '../../store/playlistStore';
import { useVideoStore } from '../../store/videoStore';
import { formatDuration, formatFileSize } from '../../utils/fileManager';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { playlists, removeVideoFromPlaylist, addVideoToPlaylist } = usePlaylistStore();
  const { videos } = useVideoStore();

  const playlist = playlists.find((p) => p.id === id);
  const [showAddModal, setShowAddModal] = useState(false);

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Playlist không tìm thấy</Text>
      </SafeAreaView>
    );
  }

  const playlistVideos = playlist.videoIds
    .map((vid) => videos.find((v) => v.id === vid))
    .filter(Boolean);

  const availableVideos = videos.filter(
    (v) => !playlist.videoIds.includes(v.id)
  );

  const handlePlayAll = () => {
    if (playlistVideos.length > 0 && playlistVideos[0]) {
      router.push({
        pathname: '/player',
        params: {
          videoId: playlistVideos[0].id,
          playlistId: playlist.id,
        },
      });
    }
  };

  const handleAddVideo = (videoId: string) => {
    addVideoToPlaylist(playlist.id, videoId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{playlist.name}</Text>
          <Text style={styles.subtitle}>
            {playlistVideos.length} video
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.playAllBtn}
          onPress={handlePlayAll}
          disabled={playlistVideos.length === 0}
          activeOpacity={0.8}
        >
          <Play size={18} color={Colors.text} fill={Colors.text} />
          <Text style={styles.playAllText}>Phát tất cả</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addVideoBtn}
          onPress={() => setShowAddModal(!showAddModal)}
        >
          <Plus size={18} color={Colors.primary} />
          <Text style={styles.addVideoText}>Thêm video</Text>
        </TouchableOpacity>
      </View>

      {/* Add video list */}
      {showAddModal && availableVideos.length > 0 && (
        <View style={styles.addSection}>
          <Text style={styles.addSectionTitle}>Chọn video để thêm</Text>
          {availableVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.addItem}
              onPress={() => handleAddVideo(video.id)}
            >
              <Film size={18} color={Colors.textSecondary} />
              <Text style={styles.addItemText} numberOfLines={1}>
                {video.title}
              </Text>
              <Plus size={16} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Videos */}
      <FlatList
        data={playlistVideos}
        keyExtractor={(item) => item!.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          if (!item) return null;
          return (
            <View style={styles.videoItem}>
              <Text style={styles.videoIndex}>{index + 1}</Text>
              <TouchableOpacity
                style={styles.videoInfo}
                onPress={() =>
                  router.push({
                    pathname: '/player',
                    params: { videoId: item.id },
                  })
                }
              >
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.videoMeta}>
                  {item.duration > 0 && formatDuration(item.duration)}
                  {item.size > 0 && ` • ${formatFileSize(item.size)}`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  removeVideoFromPlaylist(playlist.id, item.id)
                }
              >
                <Trash2 size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>
              Chưa có video trong playlist
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  errorText: {
    color: Colors.text,
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    padding: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  playAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  playAllText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  addVideoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addVideoText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  addSection: {
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    maxHeight: 200,
  },
  addSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  addItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  addItemText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.card,
  },
  videoIndex: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textMuted,
    width: 28,
    textAlign: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  videoMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
