export interface VideoItem {
  id: string;
  title: string;
  uri: string;
  thumbnailUri?: string;
  duration: number; // seconds
  size: number; // bytes
  addedAt: number; // timestamp
  lastPlayedAt?: number;
  lastPosition?: number; // seconds — resume playback
  favorite: boolean;
  highlights: number[]; // timestamps in seconds for "climax" jump
}

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: number;
  coverUri?: string;
}

export interface VideoEnhancement {
  brightness: number; // -100 to 100, default 0
  contrast: number; // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
}

export type SortOption = 'name' | 'dateAdded' | 'size' | 'lastPlayed';
export type ViewMode = 'grid' | 'list';

export const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3] as const;
export type SpeedOption = (typeof SPEED_OPTIONS)[number];

export const ENHANCEMENT_PRESETS = {
  default: { brightness: 0, contrast: 0, saturation: 0 },
  sharp: { brightness: -5, contrast: 45, saturation: 20 }, // Tăng mạnh Contrast để làm nổi bật cạnh (nét ảo)
  vivid: { brightness: 5, contrast: 25, saturation: 50 },
  cinema: { brightness: -15, contrast: 30, saturation: 15 },
} as const;

export type EnhancementPreset = keyof typeof ENHANCEMENT_PRESETS;
