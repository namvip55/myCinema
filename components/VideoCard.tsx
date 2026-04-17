import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Heart, Clock } from 'lucide-react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';
import { formatDuration, formatFileSize } from '../utils/fileManager';
import type { VideoItem, ViewMode } from '../constants/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoCardProps {
  video: VideoItem;
  viewMode: ViewMode;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function VideoCard({
  video,
  viewMode,
  onPress,
  onLongPress,
}: VideoCardProps) {
  const progress =
    video.lastPosition && video.duration > 0
      ? video.lastPosition / video.duration
      : 0;

  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        style={styles.listContainer}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.listThumbnail}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.bgElevated]}
            style={styles.thumbnailGradient}
          >
            <Play size={24} color={Colors.text} fill={Colors.text} />
          </LinearGradient>
          {video.duration > 0 && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {formatDuration(video.duration)}
              </Text>
            </View>
          )}
          {progress > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          )}
        </View>

        <View style={styles.listInfo}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.listMeta}>
            {formatFileSize(video.size)}
            {video.highlights.length > 0 && ` • ⚡ ${video.highlights.length}`}
          </Text>
        </View>

        {video.favorite && (
          <Heart size={16} color={Colors.danger} fill={Colors.danger} />
        )}
      </TouchableOpacity>
    );
  }

  // Grid mode
  const cardWidth = (SCREEN_WIDTH - Spacing.lg * 3) / 2;

  return (
    <TouchableOpacity
      style={[styles.gridContainer, { width: cardWidth }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.gridThumbnail, { height: cardWidth * 0.6 }]}>
        <LinearGradient
          colors={[Colors.primaryDark, Colors.bgElevated]}
          style={styles.thumbnailGradient}
        >
          <Play size={28} color={Colors.text} fill={Colors.text} />
        </LinearGradient>

        {video.duration > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.duration)}
            </Text>
          </View>
        )}

        {video.favorite && (
          <View style={styles.favoriteBadge}>
            <Heart size={12} color={Colors.danger} fill={Colors.danger} />
          </View>
        )}

        {video.highlights.length > 0 && (
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightBadgeText}>
              ⚡ {video.highlights.length}
            </Text>
          </View>
        )}

        {progress > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        )}
      </View>

      <View style={styles.gridInfo}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.gridMeta}>{formatFileSize(video.size)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid
  gridContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  gridThumbnail: {
    width: '100%',
    position: 'relative',
  },
  gridInfo: {
    padding: Spacing.sm,
  },
  gridTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  gridMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // List
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.card,
  },
  listThumbnail: {
    width: 100,
    height: 60,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  listMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Shared
  thumbnailGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  highlightBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  highlightBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
});
