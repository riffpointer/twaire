import React, { useRef, useState, useEffect } from "react";
import { Box, IconButton, Slider, Typography, Fade, Slide, CircularProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

const VideoPlayer = ({ src, autoPlay = false, ...props }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

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
    }, 1500);
  };

  useEffect(() => {
    resetHideTimeout();
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

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
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
    resetHideTimeout();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement; // outer Box
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      setFullscreen(true);
      videoContainer.requestFullscreen().catch((err) => {
        setFullscreen(false);
        console.log("Unable to go fullscreen: " + err);
      });
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <Box
      {...props} // <-- forward all props to the container
      sx={{
        width: "100%",
        position: "relative",
        bgcolor: "black",
        height: { xs: 300, md: 500 },
        overflow: "hidden",
        borderRadius: 2,
        ...props.sx, // merge custom sx if passed
      }}
      onMouseMove={resetHideTimeout}
    >

      {/* Video clickable area */}
      <Box
        onClick={togglePlay}
        sx={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      <video
        ref={videoRef}
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 0 }}
        onContextMenu={(e) => {
          e.preventDefault();
          props.onContextMenu?.(e); // call custom handler if passed
        }}
        autoPlay={autoPlay}
      />

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
          <CircularProgress color="inherit" />
        </Box>
      )}

      {/* Center Play/Pause Icon */}
      <Fade in={showCenterIcon}>
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
          {playing ? (
            <PauseIcon sx={{ color: "white", fontSize: 60 }} />
          ) : (
            <PlayArrowIcon sx={{ color: "white", fontSize: 60 }} />
          )}
        </Box>
      </Fade>

      {/* Bottom Controls */}
      <Slide in={showControls} direction="up">
        <Box
          onClick={(e) => e.stopPropagation()} // prevent play/pause toggle
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            bgcolor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0,
            zIndex: 3,
          }}
        >
          <IconButton onClick={togglePlay} sx={{ color: "white" }}>
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <Slider
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            sx={{ mx: 1, flex: 1 }}
            size="small"
          />

          <IconButton
            onClick={() => {
              setPrevVolume(volume);
              const video = videoRef.current;
              if (!video) return;
              video.muted = !video.muted;
              setMuted(video.muted);
              setVolume(video.muted ? 0 : prevVolume);
              resetHideTimeout();
            }}
            sx={{ color: "white" }}
          >
            {muted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            sx={{ width: 100, mr: 1 }}
            size="small"
          />
          <Typography sx={{ color: "white", ml: 2, minWidth: 50 }}>
            {formatTime(currentTime)}
          </Typography>

          <IconButton onClick={handleFullscreen} sx={{ color: "white", mr: 1, p: 0 }} title="Fullscreen">
            <FullscreenIcon />
          </IconButton>
        </Box>
      </Slide>
    </Box>
  );
};

export default VideoPlayer;
