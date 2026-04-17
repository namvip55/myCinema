import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VideoItem, SortOption, ViewMode, VideoEnhancement } from '../constants/types';

interface VideoState {
  videos: VideoItem[];
  searchQuery: string;
  sortBy: SortOption;
  viewMode: ViewMode;
  enhancement: VideoEnhancement;

  // Video CRUD
  addVideo: (video: VideoItem) => void;
  removeVideo: (id: string) => void;
  updateVideo: (id: string, data: Partial<VideoItem>) => void;

  // Playback
  updatePlaybackPosition: (id: string, position: number) => void;
  toggleFavorite: (id: string) => void;

  // Highlights
  addHighlight: (id: string, timestamp: number) => void;
  removeHighlight: (id: string, timestamp: number) => void;

  // UI
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setEnhancement: (e: Partial<VideoEnhancement>) => void;
  resetEnhancement: () => void;

  // Computed
  getFilteredVideos: () => VideoItem[];
  getContinueWatching: () => VideoItem[];
}

const defaultEnhancement: VideoEnhancement = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
};

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: [],
      searchQuery: '',
      sortBy: 'dateAdded',
      viewMode: 'grid',
      enhancement: { ...defaultEnhancement },

      addVideo: (video) =>
        set((state) => ({
          videos: [video, ...state.videos],
        })),

      removeVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((v) => v.id !== id),
        })),

      updateVideo: (id, data) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id ? { ...v, ...data } : v
          ),
        })),

      updatePlaybackPosition: (id, position) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id
              ? { ...v, lastPosition: position, lastPlayedAt: Date.now() }
              : v
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id ? { ...v, favorite: !v.favorite } : v
          ),
        })),

      addHighlight: (id, timestamp) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id
              ? {
                  ...v,
                  highlights: [...v.highlights, timestamp].sort(
                    (a, b) => a - b
                  ),
                }
              : v
          ),
        })),

      removeHighlight: (id, timestamp) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id
              ? {
                  ...v,
                  highlights: v.highlights.filter((h) => h !== timestamp),
                }
              : v
          ),
        })),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setEnhancement: (e) =>
        set((state) => ({
          enhancement: { ...state.enhancement, ...e },
        })),
      resetEnhancement: () =>
        set({ enhancement: { ...defaultEnhancement } }),

      getFilteredVideos: () => {
        const { videos, searchQuery, sortBy } = get();
        let filtered = videos;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter((v) =>
            v.title.toLowerCase().includes(q)
          );
        }

        switch (sortBy) {
          case 'name':
            filtered = [...filtered].sort((a, b) =>
              a.title.localeCompare(b.title)
            );
            break;
          case 'dateAdded':
            filtered = [...filtered].sort((a, b) => b.addedAt - a.addedAt);
            break;
          case 'size':
            filtered = [...filtered].sort((a, b) => b.size - a.size);
            break;
          case 'lastPlayed':
            filtered = [...filtered].sort(
              (a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0)
            );
            break;
        }

        return filtered;
      },

      getContinueWatching: () => {
        const { videos } = get();
        return videos
          .filter(
            (v) =>
              v.lastPosition &&
              v.lastPosition > 5 &&
              v.duration > 0 &&
              v.lastPosition < v.duration - 10
          )
          .sort(
            (a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0)
          )
          .slice(0, 10);
      },
    }),
    {
      name: 'mycinema-videos',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        videos: state.videos,
        sortBy: state.sortBy,
        viewMode: state.viewMode,
        enhancement: state.enhancement,
      }),
    }
  )
);
