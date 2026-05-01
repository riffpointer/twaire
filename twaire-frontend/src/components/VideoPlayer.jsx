import { Box, Button, CircularProgress, Fade, IconButton, Menu, MenuItem, Slide, Slider, Snackbar, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useRef, useState } from "react";

const makeBiIcon = (cls) => ({ fontSize, className = "", ...props }) => (
  <Box component="i" className={`${cls}${fontSize === "small" ? " fs-6" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true" {...props} />
);
const FullscreenIcon = makeBiIcon("bi bi-fullscreen");
const FastForwardIcon = makeBiIcon("bi bi-skip-forward-fill");
const FastRewindIcon = makeBiIcon("bi bi-skip-backward-fill");
const PauseIcon = makeBiIcon("bi bi-pause-fill");
const PlayArrowIcon = makeBiIcon("bi bi-play-fill");
const ReplayIcon = makeBiIcon("bi bi-arrow-repeat");
const SkipNextIcon = makeBiIcon("bi bi-skip-forward-fill");
const SlowMotionVideoIcon = makeBiIcon("bi bi-speedometer2");
const VolumeOffIcon = makeBiIcon("bi bi-volume-mute");
const VolumeUpIcon = makeBiIcon("bi bi-volume-up");

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const UP_NEXT_SECONDS = 5;
const AUTOPLAY_NEXT_VIDEO_STORAGE_KEY = "video-autoplay-next-video";

const VideoPlayer = ({
  src,
  autoPlay = false,
  videoElementId = "main-video-player",
  startAtSeconds = null,
  onNextVideo,
  hasNextVideo = false,
  nextVideoTitle = "",
  ...props
}) => {
  const videoRef = useRef(null);
  const initialSeekAppliedRef = useRef(false);
  const [playing, setPlaying] = useState(autoPlay);
  const [ended, setEnded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("video-volume");
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [prevVolume, setPrevVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [skipDirection, setSkipDirection] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(() => {
    const saved = localStorage.getItem("video-playback-rate");
    const parsed = saved !== null ? Number.parseFloat(saved) : 1;
    return PLAYBACK_RATES.includes(parsed) ? parsed : 1;
  });
  const [upNextVisible, setUpNextVisible] = useState(false);
  const [upNextRemaining, setUpNextRemaining] = useState(UP_NEXT_SECONDS);
  const [upNextCancelled, setUpNextCancelled] = useState(false);
  const [showAutoplayNextPrompt, setShowAutoplayNextPrompt] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [volumePopupOpen, setVolumePopupOpen] = useState(false);
  const [autoplayNextVideo, setAutoplayNextVideo] = useState(() => {
    const saved = localStorage.getItem(AUTOPLAY_NEXT_VIDEO_STORAGE_KEY);
    if (saved === null) return true;
    return saved !== "false";
  });
  const [speedMenuAnchorEl, setSpeedMenuAnchorEl] = useState(null);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const ignoreNextClickRef = useRef(false);
  const hasAutoNavigatedRef = useRef(false);
  const onNextVideoRef = useRef(onNextVideo);
  const hasNextVideoRef = useRef(hasNextVideo);
  const upNextCancelledRef = useRef(upNextCancelled);
  const autoplayNextVideoRef = useRef(autoplayNextVideo);
  const speedMenuOpen = Boolean(speedMenuAnchorEl);

  useEffect(() => {
    onNextVideoRef.current = onNextVideo;
  }, [onNextVideo]);

  useEffect(() => {
    hasNextVideoRef.current = hasNextVideo;
  }, [hasNextVideo]);

  useEffect(() => {
    upNextCancelledRef.current = upNextCancelled;
  }, [upNextCancelled]);

  useEffect(() => {
    autoplayNextVideoRef.current = autoplayNextVideo;
    localStorage.setItem(AUTOPLAY_NEXT_VIDEO_STORAGE_KEY, autoplayNextVideo ? "true" : "false");
  }, [autoplayNextVideo]);

  const triggerNextVideo = () => {
    if (hasAutoNavigatedRef.current) return;
    if (!hasNextVideoRef.current) return;
    if (upNextCancelledRef.current) return;
    if (!autoplayNextVideoRef.current) return;
    if (typeof onNextVideoRef.current !== "function") return;

    hasAutoNavigatedRef.current = true;
    onNextVideoRef.current();
  };

  useEffect(() => {
    localStorage.setItem("video-volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("video-playback-rate", playbackRate.toString());
  }, [playbackRate]);

  let hideTimeout = useRef(null);

  const resetHideTimeout = () => {
    setShowControls(true);
    document.body.style.cursor = "default";
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (fullscreen) {
        document.body.style.cursor = "none";
      }
      setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    resetHideTimeout();
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => {
      setBuffering(false);
      setPlaying(true);
      setEnded(false);
    };
    const handleEnded = () => {
      if (!upNextCancelledRef.current && hasNextVideoRef.current && typeof onNextVideoRef.current === "function") {
        triggerNextVideo();
        return;
      }
      setPlaying(false);
      setEnded(true);
      setShowCenterIcon(true);
    };
    const handlePause = () => setPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = muted;
      video.playbackRate = playbackRate;
    }
  }, [volume, muted, playbackRate]);

  useEffect(() => {
    initialSeekAppliedRef.current = false;
  }, [src, startAtSeconds]);

  useEffect(() => {
    hasAutoNavigatedRef.current = false;
    setUpNextVisible(false);
    setUpNextRemaining(UP_NEXT_SECONDS);
    setUpNextCancelled(false);
    setShowAutoplayNextPrompt(false);
    setLoadError("");
  }, [src, startAtSeconds]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!Number.isFinite(startAtSeconds) || startAtSeconds < 0 || initialSeekAppliedRef.current) return;

    const applyStartTime = () => {
      if (initialSeekAppliedRef.current) return;
      const safeDuration = Number.isFinite(video.duration) ? video.duration : null;
      const target = safeDuration ? Math.min(startAtSeconds, Math.max(safeDuration - 0.1, 0)) : startAtSeconds;
      video.currentTime = Math.max(target, 0);
      setCurrentTime(video.currentTime);
      initialSeekAppliedRef.current = true;
    };

    if (video.readyState >= 1) {
      applyStartTime();
      return;
    }

    video.addEventListener("loadedmetadata", applyStartTime, { once: true });
    return () => video.removeEventListener("loadedmetadata", applyStartTime);
  }, [startAtSeconds, src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const videoContainer = videoRef.current?.parentElement;
      setFullscreen(Boolean(videoContainer && document.fullscreenElement === videoContainer));
      resetHideTimeout();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const intervalId = window.setInterval(() => {
      if (hasAutoNavigatedRef.current) return;
      if (!autoplayNextVideoRef.current) {
        setUpNextVisible(false);
        return;
      }
      if (upNextCancelledRef.current || !hasNextVideoRef.current || typeof onNextVideoRef.current !== "function") {
        setUpNextVisible(false);
        return;
      }

      const safeDuration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!safeDuration) {
        setUpNextVisible(false);
        return;
      }

      const remaining = Math.max(0, safeDuration - (video.currentTime || 0));
      if (remaining <= 0) {
        if (!video.paused) {
          triggerNextVideo();
        }
        return;
      }

      if (remaining <= UP_NEXT_SECONDS) {
        setUpNextRemaining(remaining);
        setUpNextVisible(true);
      } else {
        setUpNextVisible(false);
        setUpNextRemaining(UP_NEXT_SECONDS);
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (ended) {
      video.currentTime = 0;
      video.play();
      setEnded(false);
      setPlaying(true);
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 800);
      resetHideTimeout();
      return;
    }

    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }

    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 800);

    resetHideTimeout();
  };

  useEffect(() => {
    resetHideTimeout();
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => {
      setBuffering(false);
      setLoadError("");
    };
    const handleError = () => {
      const messageByCode = {
        1: "The video loading was aborted.",
        2: "The video could not be loaded.",
        3: "The video format is not supported or the file is invalid.",
        4: "The video source is unavailable or invalid.",
      };
      setBuffering(false);
      setLoadError(messageByCode[video.error?.code] || "The video could not be loaded.");
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("error", handleError);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("error", handleError);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const handleVolumeChange = (e, value) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    if (value > 0 && video.muted) video.muted = false;
    setVolume(value);
    setPrevVolume(volume);
    setMuted(video.muted);
    resetHideTimeout();
  };

  const handleProgressChange = (e, value) => {
    if (!isSeeking) setIsSeeking(true);
    setSeekTime(value);
    setCurrentTime(value);
    resetHideTimeout();
  };

  const handleProgressChangeCommitted = (e, value) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setIsSeeking(false);
    resetHideTimeout();
  };

  // Smooth time update during seeking
  useEffect(() => {
    if (!isSeeking) return;
    let animationId;
    const animate = () => {
      const video = videoRef.current;
      if (video) {
        const diff = seekTime - video.currentTime;
        if (Math.abs(diff) > 0.1) {
          video.currentTime += diff * 0.15;
          animationId = requestAnimationFrame(animate);
        }
      }
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isSeeking, seekTime]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const flashSkipDirection = (direction) => {
    setSkipDirection(direction);
    setShowCenterIcon(true);
    window.clearTimeout(hideTimeout.current);
    window.setTimeout(() => {
      setSkipDirection(null);
      setShowCenterIcon(false);
      resetHideTimeout();
    }, 650);
  };

  const skipBy = (seconds, direction) => {
    const video = videoRef.current;
    if (!video) return;

    const nextTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || video.currentTime + seconds);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    if (isSeeking) {
      setIsSeeking(false);
      setSeekTime(nextTime);
    }
    if (video.ended && nextTime < (video.duration || nextTime)) {
      setEnded(false);
    }
    flashSkipDirection(direction);
  };

  const handleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement; // outer Box
    if (!videoContainer) return;

    if (document.fullscreenElement === videoContainer) {
      document.exitFullscreen().catch((err) => {
        console.log("Unable to exit fullscreen: " + err);
      });
      return;
    }

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => {
        setFullscreen(false);
        console.log("Unable to go fullscreen: " + err);
      });
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setSpeedMenuAnchorEl(null);
    resetHideTimeout();
  };

  const handleWheelVolume = (event) => {
    const video = videoRef.current;
    if (!video) return;

    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;
    const step = event.shiftKey ? 0.2 : 0.05;
    const nextVolume = Math.max(0, Math.min(1, volume + direction * step));

    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    setMuted(video.muted);
    setVolume(nextVolume);
    if (nextVolume > 0) {
      setPrevVolume(nextVolume);
    }
    resetHideTimeout();
  };

  const handleCancelUpNext = () => {
    setUpNextCancelled(true);
    setUpNextVisible(false);
    setShowAutoplayNextPrompt(true);
  };

  const handleFullscreenRef = useRef(handleFullscreen);
  handleFullscreenRef.current = handleFullscreen;

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isInputActive = document.activeElement && (
        document.activeElement.tagName === "INPUT" || 
        document.activeElement.tagName === "TEXTAREA" || 
        document.activeElement.isContentEditable
      );
      if (isInputActive) return;

      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        handleFullscreenRef.current();
      } else if (e.key === "?") {
        e.preventDefault();
        setShowShortcutsDialog(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <Box
      {...props} // <-- forward all props to the container
      sx={{
        width: "100%",
        position: "relative",
        bgcolor: "black",
        aspectRatio: "16 / 9",
        height: "auto",
        minHeight: { xs: 240, md: 360 },
        overflow: "hidden",
        borderRadius: 2,
        ...props.sx, // merge custom sx if passed
      }}
      onMouseMove={resetHideTimeout}
      onWheel={handleWheelVolume}
    >

      {/* Video clickable area */}
      <Box
        onClick={(e) => {
          if (ignoreNextClickRef.current) {
            ignoreNextClickRef.current = false;
            return;
          }
          togglePlay();
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFullscreen();
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== "touch") return;
          const rect = e.currentTarget.getBoundingClientRect();
          const xRatio = (e.clientX - rect.left) / rect.width;
          const isLeftSide = xRatio <= 0.35;
          const isRightSide = xRatio >= 0.65;

          if (!isLeftSide && !isRightSide) return;

          e.preventDefault();
          e.stopPropagation();
          ignoreNextClickRef.current = true;
          skipBy(isLeftSide ? -5 : 5, isLeftSide ? "back" : "forward");
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "k") {
            e.preventDefault();
            togglePlay();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            skipBy(-5, "back");
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            skipBy(5, "forward");
          }
        }}
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        sx={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          outline: focused ? "2px solid" : "none",
          outlineColor: "primary.main",
        }}
      />

      <video
        id={videoElementId}
        ref={videoRef}
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 0 }}
        onContextMenu={(e) => {
          e.preventDefault();
          props.onContextMenu?.(e); // call custom handler if passed
        }}
        autoPlay={autoPlay}
      />

      {loadError && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            textAlign: "center",
            bgcolor: "rgba(0, 0, 0, 0.82)",
          }}
        >
          <Box sx={{ maxWidth: 420 }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700, mb: 1 }}>
              Video unavailable
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
              {loadError}
            </Typography>
          </Box>
        </Box>
      )}

      {buffering && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <CircularProgress color="inherit" size={36} thickness={5} sx={{ filter: "drop-shadow(0px 0px 3px #000000A0)" }} />
        </Box>
      )}

      {/* Center Play/Pause/Replay Icon */}
      <Fade in={showCenterIcon || ended}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "rgba(0,0,0,0.3)",
            borderRadius: "50%",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {ended ? (
            <ReplayIcon sx={{ color: "white", fontSize: 60 }} />
          ) : skipDirection === "back" ? (
            <FastRewindIcon sx={{ color: "white", fontSize: 60 }} />
          ) : skipDirection === "forward" ? (
            <FastForwardIcon sx={{ color: "white", fontSize: 60 }} />
          ) : playing ? (
            <PauseIcon sx={{ color: "white", fontSize: 60 }} />
          ) : (
            <PlayArrowIcon sx={{ color: "white", fontSize: 60 }} />
          )}
        </Box>
      </Fade>

      <Fade in={upNextVisible && !ended}>
        <Box
          sx={{
            position: "absolute",
            right: 16,
            bottom: 78,
            zIndex: 5,
            bgcolor: "rgba(0,0,0,0.76)",
            color: "white",
            borderRadius: 2,
            px: 1.75,
            py: 1.4,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        >
          <Box sx={{ position: "relative", width: 48, height: 48 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={48}
              thickness={5}
              sx={{ color: "rgba(255,255,255,0.22)", position: "absolute", inset: 0 }}
            />
            <CircularProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, (upNextRemaining / UP_NEXT_SECONDS) * 100))}
              size={48}
              thickness={5}
              sx={{ color: "white", position: "absolute", inset: 0 }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {Math.ceil(upNextRemaining)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              Up Next
            </Typography>
            {nextVideoTitle ? (
              <Typography variant="caption" sx={{ opacity: 0.85, display: "block", mb: 0.5 }}>
                {nextVideoTitle}
              </Typography>
            ) : null}
            <Button
              size="small"
              variant="outlined"
              onClick={handleCancelUpNext}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.7)",
                minWidth: 0,
                px: 1,
                py: 0.25,
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
          >
            Cancel
          </Button>
          </Box>
        </Box>
      </Fade>

      <Snackbar
        open={showAutoplayNextPrompt}
        autoHideDuration={6000}
        onClose={() => setShowAutoplayNextPrompt(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        message="Autoplay next video is on. Disable it?"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              setAutoplayNextVideo(false);
              setShowAutoplayNextPrompt(false);
            }}
          >
            Disable
          </Button>
        }
        ContentProps={{
          sx: {
            bgcolor: "rgba(20,20,20,0.96)",
            color: "white",
          },
        }}
      />

      {/* Bottom Controls */}
      <Slide in={showControls} direction="up">
        <Box
          onClick={(e) => e.stopPropagation()} // prevent play/pause toggle
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(5, 5, 5, 1) 100%)",
            // backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 1,
            zIndex: 3,
          }}
        >
          <IconButton onClick={togglePlay} sx={{ color: "white" }} title={playing ? "Pause" : "Play"}>
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={onNextVideo}
            sx={{ color: "white" }}
            title="Next video"
            aria-label="Next video"
            disabled={!hasNextVideo || typeof onNextVideo !== "function"}
          >
            <SkipNextIcon />
          </IconButton>
          <Typography sx={{ color: "white", ml: 1, minWidth: 50 }}>
            {formatTime(isSeeking ? seekTime : currentTime)}
          </Typography>
          <Slider
            min={0}
            max={duration || 0}
            value={isSeeking ? seekTime : currentTime}
            onChange={handleProgressChange}
            onChangeCommitted={handleProgressChangeCommitted}
            sx={{ mx: 1, flex: 1 }}
            size="small"
          />

          <Box
            onMouseEnter={() => setVolumePopupOpen(true)}
            onMouseLeave={() => setVolumePopupOpen(false)}
            onFocus={() => setVolumePopupOpen(true)}
            onBlur={() => setVolumePopupOpen(false)}
            sx={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            <IconButton
              onClick={() => {
                setPrevVolume(volume);
                const video = videoRef.current;
                if (!video) return;
                video.muted = !video.muted;
                setMuted(video.muted);
                setVolume(video.muted ? 0 : prevVolume);
                resetHideTimeout();
                setVolumePopupOpen(true);
              }}
              sx={{ color: "white" }}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slide in={volumePopupOpen} direction="up" mountOnEnter unmountOnExit timeout={180}>
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                  bgcolor: "rgba(20,20,20,0.96)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 2,
                  px: 0.75,
                  py: 0.75,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: 4,
                }}
              >
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  orientation="vertical"
                  sx={{ height: 100 }}
                  size="small"
                />
              </Box>
            </Slide>
          </Box>

          <IconButton
            onClick={(e) => setSpeedMenuAnchorEl(e.currentTarget)}
            sx={{ color: "white", ml: 0.5 }}
            title={`Playback speed (${playbackRate}x)`}
          >
            <SlowMotionVideoIcon />
          </IconButton>
          <Menu
            anchorEl={speedMenuAnchorEl}
            open={speedMenuOpen}
            onClose={() => setSpeedMenuAnchorEl(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            {PLAYBACK_RATES.map((rate) => (
              <MenuItem
                key={rate}
                selected={rate === playbackRate}
                onClick={() => handlePlaybackRateChange(rate)}
              >
                {rate}x
              </MenuItem>
            ))}
          </Menu>

          {/* Full Screen button */}
          <IconButton onClick={handleFullscreen} sx={{ color: "white" }} title="Fullscreen">
            <FullscreenIcon />
          </IconButton>
        </Box>
      </Slide>

      <Dialog open={showShortcutsDialog} onClose={() => setShowShortcutsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <Typography><strong>Space / k:</strong> Play / Pause</Typography>
            <Typography><strong>f:</strong> Fullscreen</Typography>
            <Typography><strong>Arrow Left:</strong> Seek backward 5s</Typography>
            <Typography><strong>Arrow Right:</strong> Seek forward 5s</Typography>
            <Typography><strong>Shift + ?:</strong> Show shortcuts</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShortcutsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoPlayer;
