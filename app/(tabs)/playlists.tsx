import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ListVideo, Trash2, Edit, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
import { usePlaylistStore } from '../../store/playlistStore';
import { useVideoStore } from '../../store/videoStore';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePlaylistStore();
  const { videos } = useVideoStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      const playlist = createPlaylist(newName.trim());
      setNewName('');
      setShowCreate(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Xóa playlist?', `Xóa "${name}"? Video sẽ không bị xóa.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deletePlaylist(id),
      },
    ]);
  };

  const handleRename = (id: string, currentName: string) => {
    Alert.prompt
      ? Alert.prompt('Đổi tên', '', (text) => {
          if (text?.trim()) renamePlaylist(id, text.trim());
        }, 'plain-text', currentName)
      : Alert.alert('Chức năng', 'Đổi tên playlist trong chi tiết');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Playlist</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreate(true)}
        >
          <Plus size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <ListVideo size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Chưa có playlist</Text>
          <Text style={styles.emptyDesc}>
            Tạo playlist để nhóm video và phát liên tiếp
          </Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreate(true)}
          >
            <Plus size={18} color={Colors.text} />
            <Text style={styles.createBtnText}>Tạo playlist mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const videoCount = item.videoIds.length;
            return (
              <TouchableOpacity
                style={styles.playlistCard}
                onPress={() =>
                  router.push({
                    pathname: '/playlist/[id]',
                    params: { id: item.id },
                  })
                }
                onLongPress={() => handleDelete(item.id, item.name)}
                activeOpacity={0.7}
              >
                <View style={styles.playlistIcon}>
                  <ListVideo size={24} color={Colors.primary} />
                </View>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{item.name}</Text>
                  <Text style={styles.playlistMeta}>
                    {videoCount} video
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo playlist mới</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên playlist..."
              placeholderTextColor={Colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              selectionColor={Colors.primary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setShowCreate(false);
                  setNewName('');
                }}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmit, !newName.trim() && { opacity: 0.5 }]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Text style={styles.modalSubmitText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  playlistIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  playlistMeta: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  createBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modalContent: {
    backgroundColor: Colors.bgElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  modalInput: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  modalCancel: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  modalCancelText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  modalSubmit: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  modalSubmitText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
