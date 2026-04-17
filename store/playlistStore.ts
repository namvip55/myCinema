import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Playlist } from '../constants/types';

interface PlaylistState {
  playlists: Playlist[];

  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addVideoToPlaylist: (playlistId: string, videoId: string) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  reorderVideos: (playlistId: string, videoIds: string[]) => void;
  setCover: (playlistId: string, coverUri: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],

      createPlaylist: (name: string) => {
        const playlist: Playlist = {
          id: generateId(),
          name,
          videoIds: [],
          createdAt: Date.now(),
        };
        set((state) => ({
          playlists: [playlist, ...state.playlists],
        }));
        return playlist;
      },

      deletePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        })),

      renamePlaylist: (id, name) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      addVideoToPlaylist: (playlistId, videoId) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId && !p.videoIds.includes(videoId)
              ? { ...p, videoIds: [...p.videoIds, videoId] }
              : p
          ),
        })),

      removeVideoFromPlaylist: (playlistId, videoId) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, videoIds: p.videoIds.filter((v) => v !== videoId) }
              : p
          ),
        })),

      reorderVideos: (playlistId, videoIds) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId ? { ...p, videoIds } : p
          ),
        })),

      setCover: (playlistId, coverUri) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId ? { ...p, coverUri } : p
          ),
        })),
    }),
    {
      name: 'mycinema-playlists',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
