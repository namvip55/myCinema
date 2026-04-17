import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Zap,
  SunMedium,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useVideoStore } from '../store/videoStore';
import { formatDuration } from '../utils/fileManager';
import SpeedSelector from '../components/SpeedSelector';
import EnhancementPanel from '../components/EnhancementPanel';
import { ENHANCEMENT_PRESETS, type SpeedOption, type EnhancementPreset } from '../constants/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const router = useRouter();
  const {
    videos,
    updateVideo,
    updatePlaybackPosition,
    addHighlight,
    enhancement,
    setEnhancement,
    resetEnhancement,
  } = useVideoStore();

  const video = videos.find((v) => v.id === videoId);
  const [showControls, setShowControls] = useState(true);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(video?.lastPosition || 0);
  const [duration, setDuration] = useState(video?.duration || 0);
  const [speed, setSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gesture state
  const [gestureType, setGestureType] = useState<'none' | 'volume' | 'brightness'>('none');
  const [gestureValue, setGestureValue] = useState(0);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startGestureValue = useRef(0);

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const positionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create player
  const player = useVideoPlayer(video?.uri || '', (p) => {
    try {
      p.loop = false;
      p.playbackRate = 1;
      p.volume = 1.0;
      if (video?.lastPosition && video.lastPosition > 5) {
        p.currentTime = video.lastPosition;
      }
      p.play();
    } catch (e) {
      console.error('Player init error:', e);
    }
  });

  // Listen for status changes
  useEventListener(player, 'statusChange', (event) => {
    if (event.status === 'readyToPlay') {
      const dur = player.duration;
      if (dur > 0 && video) {
        setDuration(dur);
        if (video.duration === 0) {
          updateVideo(video.id, { duration: dur });
        }
      }
    }
  });

  useEventListener(player, 'playingChange', (event) => {
    setIsPlaying(event.isPlaying);
  });

  // Poll current time - Robust polling
  useEffect(() => {
    if (!player) return;

    positionInterval.current = setInterval(() => {
      try {
        if (player.currentTime >= 0) {
          setCurrentTime(player.currentTime);
        }
      } catch (e) {
        // Player might be invalidated
      }
    }, 500);

    return () => {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
    };
  }, [player]);

  // Save position and pause on unmount
  useEffect(() => {
    return () => {
      if (video && player) {
        try {
          const lastPos = player.currentTime;
          updatePlaybackPosition(video.id, lastPos);
          player.pause(); // Đảm bảo dừng nhạc/video khi unmount
        } catch (e) {
          console.error('Save position/cleanup error:', e);
        }
      }
    };
  }, [video, player]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [showControls]);

  // Handle back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => {
      handler.remove();
    };
  }, [handleBack]);

  // Fullscreen orientation
  useEffect(() => {
    let isMounted = true;
    
    async function updateOrientation() {
      if (!isMounted) return;
      try {
        if (isFullscreen) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch (e) {
        // Safe to ignore if component is unmounting
      }
    }

    updateOrientation();
    
    return () => {
      isMounted = false;
    };
  }, [isFullscreen]);

  const handleBack = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Khóa hướng màn hình về dọc NGAY LẬP TỨC trước khi điều hướng
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});

    if (video && player) {
      try {
        updatePlaybackPosition(video.id, player.currentTime);
        player.pause();
      } catch (e) {}
    }
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [video, player, router, updatePlaybackPosition]);

  const togglePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    resetControlsTimer();
  };

  const skip = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newTime = Math.max(0, Math.min(duration, player.currentTime + seconds));
    player.currentTime = newTime;
    setCurrentTime(newTime);
    resetControlsTimer();
  };

  const seekTo = (time: number) => {
    player.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (s: SpeedOption) => {
    setSpeed(s);
    player.playbackRate = s;
  };

  const handleHighlightJump = () => {
    if (!video || video.highlights.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Không có điểm cao trào', 'Long press trên thanh tiến trình để đánh dấu.', [{ text: 'OK' }]);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Sắp xếp highlight theo thời gian để đảm bảo timeline chuẩn
    const sortedHighlights = [...video.highlights].sort((a, b) => a - b);
    
    // Tìm điểm cao trào tiếp theo (lớn hơn currentTime hiện tại ít nhất 1 giây)
    const nextHighlight = sortedHighlights.find(h => h > currentTime + 1.5);
    
    if (nextHighlight !== undefined) {
      seekTo(nextHighlight);
    } else {
      // Nếu không còn cái nào phía trước, quay lại cái đầu tiên
      seekTo(sortedHighlights[0]);
    }
    resetControlsTimer();
  };

  const handleAddHighlight = () => {
    if (!video) return;
    const time = Math.floor(player.currentTime);
    addHighlight(video.id, time);
    Alert.alert('Đã đánh dấu', `Đã thêm điểm cao trào tại ${formatDuration(time)}`);
  };

  const handlePreset = (preset: EnhancementPreset) => {
    const values = ENHANCEMENT_PRESETS[preset];
    setEnhancement(values);
  };

  const resetControlsTimer = () => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    setShowControls(true);
  };

  // --- Phase 3: Gestures ---
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      const { x } = event;
      const isRightSide = x > (isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH) / 2;
      
      if (isRightSide) {
        // Volume logic
        const currentVol = player.volume;
        setGestureType('volume');
        setGestureValue(Math.round(currentVol * 100));
        startGestureValue.current = currentVol;
      } else {
        // Brightness logic
        const currentBright = enhancement.brightness;
        setGestureType('brightness');
        setGestureValue(currentBright + 100); // Map -100..100 to 0..200
        startGestureValue.current = currentBright;
      }
    })
    .onUpdate((event) => {
      const { translationY } = event;
      // Sensitivity factor
      const sensitivity = 0.5;
      const delta = -(translationY * sensitivity);

      if (gestureType === 'volume') {
        const nextVol = Math.max(0, Math.min(1, startGestureValue.current + delta / 100));
        player.volume = nextVol;
        setGestureValue(Math.round(nextVol * 100));
      } else {
        const nextBright = Math.max(-100, Math.min(100, startGestureValue.current + delta));
        setEnhancement({ brightness: nextBright });
        setGestureValue(nextBright + 100);
      }
    })
    .onEnd(() => {
      if (overlayTimer.current) clearTimeout(overlayTimer.current);
      overlayTimer.current = setTimeout(() => {
        setGestureType('none');
      }, 1000);
    })
    .runOnJS(true);

  // Combine gestures
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      const { x } = event;
      const width = isFullscreen ? SCREEN_HEIGHT : SCREEN_WIDTH;
      if (x < width / 3) {
        skip(-10);
      } else if (x > (width * 2) / 3) {
        skip(10);
      } else {
        togglePlayPause();
      }
    })
    .runOnJS(true);

  const singleTap = Gesture.Tap()
    .onStart(() => {
      setShowControls(!showControls);
    })
    .runOnJS(true);

  const composedGesture = Gesture.Exclusive(doubleTap, singleTap, panGesture);

  // Enhancement filter overlay opacity
  const enhancementStyle = {
    opacity: 1 + enhancement.brightness / 200,
    contrast: 1 + enhancement.contrast / 100,
  };

  if (!video) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Video không tìm thấy</Text>
      </View>
    );
  }

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.container}>
      {/* Gesture Detector Wrap */}
      <GestureDetector gesture={composedGesture}>
        <View style={styles.videoContainer}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />

          {/* Enhancement overlay (for gestures) */}
          {(enhancement.brightness !== 0 || enhancement.contrast !== 0) && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor:
                    enhancement.brightness > 0
                      ? `rgba(255,255,255,${Math.abs(enhancement.brightness) / 300})`
                      : `rgba(0,0,0,${Math.abs(enhancement.brightness) / 300})`,
                },
              ]}
            />
          )}

          {/* Gesture Overlay Visuals */}
          {gestureType !== 'none' && (
            <View style={[
              styles.gestureOverlay,
              gestureType === 'volume' ? { right: 20 } : { left: 20 }
            ]}>
              <View style={styles.gestureIcon}>
                {gestureType === 'volume' ? (
                  gestureValue === 0 ? <VolumeX size={24} color="#FFF" /> : <Volume2 size={24} color="#FFF" />
                ) : (
                  <SunMedium size={24} color="#FFF" />
                )}
              </View>
              <View style={styles.gestureBarContainer}>
                <View style={[
                  styles.gestureBarFill,
                  { height: `${(gestureValue / (gestureType === 'volume' ? 100 : 200)) * 100}%` }
                ]} />
              </View>
              <Text style={styles.gestureValueText}>{gestureValue}{gestureType === 'volume' ? '%' : ''}</Text>
            </View>
          )}

        {/* Controls overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                <ArrowLeft size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.videoTitle} numberOfLines={1}>
                {video.title}
              </Text>
              <View style={styles.topActions}>
                <TouchableOpacity
                  onPress={() => setShowEnhancement(true)}
                  style={styles.iconBtn}
                >
                  <SunMedium size={22} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFullscreen(!isFullscreen)}
                  style={styles.iconBtn}
                >
                  {isFullscreen ? (
                    <Minimize size={22} color={Colors.text} />
                  ) : (
                    <Maximize size={22} color={Colors.text} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Center controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity onPress={() => skip(-10)} style={styles.skipBtn}>
                <SkipBack size={32} color={Colors.text} />
                <Text style={styles.skipLabel}>10s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                style={styles.playBtn}
              >
                {isPlaying ? (
                  <Pause size={36} color={Colors.text} fill={Colors.text} />
                ) : (
                  <Play size={36} color={Colors.text} fill={Colors.text} />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => skip(10)} style={styles.skipBtn}>
                <SkipForward size={32} color={Colors.text} />
                <Text style={styles.skipLabel}>10s</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom bar */}
            <View style={styles.bottomBar}>
              {/* Progress bar */}
              <TouchableOpacity
                style={styles.progressContainer}
                activeOpacity={1}
                onPress={(e) => {
                  const x = e.nativeEvent.locationX;
                  const width = SCREEN_WIDTH - Spacing.lg * 2;
                  const newTime = (x / width) * duration;
                  seekTo(Math.max(0, Math.min(duration, newTime)));
                }}
                onLongPress={handleAddHighlight}
              >
                {/* Highlight markers */}
                {video.highlights.map((hl, i) => (
                  <View
                    key={i}
                    style={[
                      styles.highlightMarker,
                      { left: `${(hl / duration) * 100}%` },
                    ]}
                  />
                ))}
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                  />
                  <View
                    style={[styles.progressThumb, { left: `${progress * 100}%` }]}
                  />
                </View>
              </TouchableOpacity>

              {/* Time + actions */}
              <View style={styles.bottomActions}>
                <Text style={styles.timeText}>
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </Text>

                <View style={styles.bottomRight}>
                  {/* Highlight jump */}
                  <TouchableOpacity
                    onPress={handleHighlightJump}
                    style={[styles.actionBtn, styles.highlightBtn]}
                  >
                    <Zap size={16} color={Colors.accent} />
                    <Text style={styles.highlightBtnText}>Cao trào</Text>
                  </TouchableOpacity>

                  {/* Speed */}
                  <TouchableOpacity
                    onPress={() => setShowSpeed(true)}
                    style={styles.actionBtn}
                  >
                    <Gauge size={16} color={Colors.text} />
                    <Text style={styles.speedBtnText}>{speed}x</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        </View>
      </GestureDetector>

      {/* Speed Selector */}
      <SpeedSelector
        visible={showSpeed}
        currentSpeed={speed}
        onSelect={handleSpeedChange}
        onClose={() => setShowSpeed(false)}
      />

      {/* Enhancement Panel */}
      <EnhancementPanel
        visible={showEnhancement}
        enhancement={enhancement}
        onUpdate={setEnhancement}
        onPreset={handlePreset}
        onReset={resetEnhancement}
        onClose={() => setShowEnhancement(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  errorText: {
    color: Colors.text,
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },

  // Top
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    gap: Spacing.md,
  },
  videoTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  topActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconBtn: {
    padding: Spacing.sm,
  },

  // Center
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  skipLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
  },
  progressContainer: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryLight,
    marginLeft: -7,
  },
  highlightMarker: {
    position: 'absolute',
    top: 6,
    width: 6,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    zIndex: 10,
    marginLeft: -3,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bottomRight: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  highlightBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  highlightBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
  },
  speedBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },

  // Gestures
  gestureOverlay: {
    position: 'absolute',
    top: '25%',
    bottom: '25%',
    width: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    zIndex: 100,
  },
  gestureIcon: {
    marginBottom: 10,
  },
  gestureBarContainer: {
    flex: 1,
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    justifyContent: 'flex-end',
  },
  gestureBarFill: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  gestureValueText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 10,
  },
});
