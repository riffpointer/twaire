import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { Box, Card, Chip, Container, Divider, Skeleton, Typography } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PublicVideosList from "@/components/PublicVideosList.jsx";
import VideoActionBar from "@/components/VideoActionBar.jsx";
import VideoPlayer from "@/components/VideoPlayer.jsx";
import VideoBookmarks from "@/components/VideoBookmarks.jsx";
import ApiConfig from "../utils/ApiConfig.js";
import { getRelativeTime } from "../utils/DateUtils.js";
import { getVideoCategoryLabel } from "../utils/VideoCategories.js";
import PromptLoginDialog from "@/components/PromptLoginDialog.jsx";
import ChannelBar from "@/components/ChannelBar.jsx";
import AppSnackbar from "@/components/AppSnackbar.jsx";
import { parseTimestampToSeconds, seekVideoElementToTimestamp, TIMESTAMP_TOKEN_PATTERN } from "../utils/videoTimestamps.js";
import React from "react";

const CommentSection = React.lazy(() => import("@/components/CommentSection.jsx"));

function Watch() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [nextVideo, setNextVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [uploaderSubs, setUploaderSubs] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [promptLoginDialogShown, showPromptLogin] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [currentUser, setCurrentUser] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [bookmarksDialogOpen, setBookmarksDialogOpen] = useState(false);
  const commentsAnchorRef = React.useRef(null);

  const showSnackbar = (message, severity = "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handlePlayPause = () => {
    const videoElement = document.getElementById("main-video-player");
    if (!videoElement) return;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
    handleClose();
  };

  const handleRestart = () => {
    const videoElement = document.getElementById("main-video-player");
    if (!videoElement) return;
    videoElement.currentTime = 0;
    videoElement.play();
    handleClose();
  };

  const getCurrentTimestampSeconds = () => {
    const videoElement = document.getElementById("main-video-player");
    if (!videoElement) return 0;
    return Math.max(0, Math.floor(videoElement.currentTime || 0));
  };

  const renderTimestampLinkedText = (text) => {
    const source = String(text || "");
    if (!source) return source;

    const pattern = new RegExp(TIMESTAMP_TOKEN_PATTERN.source, "g");
    const nodes = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(source)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(
          <React.Fragment key={`desc-text-${lastIndex}`}>
            {source.slice(lastIndex, match.index)}
          </React.Fragment>,
        );
      }

      const token = match[0];
      const seconds = parseTimestampToSeconds(token);
      nodes.push(
        <Typography
          key={`desc-ts-${match.index}`}
          component="button"
          type="button"
          title={`Click to jump to ${token}`}
          onClick={() => {
            if (Number.isFinite(seconds)) {
              seekVideoElementToTimestamp("main-video-player", seconds);
            }
          }}
          sx={{
            border: 0,
            p: 0,
            m: 0,
            bgcolor: "transparent",
            color: "primary.main",
            cursor: "pointer",
            display: "inline",
            font: "inherit",
            lineHeight: "inherit",
            textDecoration: "none",
            fontWeight: 600,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {token}
        </Typography>,
      );

      lastIndex = match.index + token.length;
    }

    if (lastIndex < source.length) {
      nodes.push(
        <React.Fragment key={`desc-text-${lastIndex}`}>
          {source.slice(lastIndex)}
        </React.Fragment>,
      );
    }

    return nodes;
  };

  const handleCopyTimestamp = async () => {
    try {
      const timestampSeconds = getCurrentTimestampSeconds();
      const url = new URL(window.location.href);
      url.searchParams.set("t", timestampSeconds.toString());
      const textToCopy = url.toString();
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const helper = document.createElement("textarea");
        helper.value = textToCopy;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.focus();
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }
      showSnackbar("Copied link at current timestamp", "success");
    } catch (err) {
      console.error("Failed to copy timestamp URL", err);
      showSnackbar("Failed to copy timestamp link");
    } finally {
      handleClose();
    }
  };

  const handleAddBookmarkAtCurrentTime = () => {
    setBookmarksDialogOpen(true);
    handleClose();
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videoDataRequest = await fetch(
          `${ApiConfig.serverUrl}/api/videos/${id}/view`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!videoDataRequest.ok) {
          const errorData = await videoDataRequest.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch video");
        }

        const data = await videoDataRequest.json();
        console.log(data);
        setVideo(data);
        document.title = `${data.title} - Twaire`;

        if (data.uploaderId) {
          const subDataRequest = await fetch(
            `${ApiConfig.serverUrl}/api/users/${data.uploaderId}/isSubscribed`,
            { credentials: "include" },
          );

          if (subDataRequest.ok) {
            const subData = await subDataRequest.json();
            setSubscribed(subData.subscribed);
          }

          const uploaderDataRequest = await fetch(
            `${ApiConfig.serverUrl}/api/users/${data.uploader.username}`,
          );

          if (uploaderDataRequest.ok) {
            const uploaderData = await uploaderDataRequest.json();
            setUploaderSubs(uploaderData.subscribers);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
    
    // Fetch current user for self-subscribe check
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch (err) {
        // Not logged in - ignore
      }
    };
    fetchCurrentUser();
  }, [id]);

  useEffect(() => {
    const fetchNextVideo = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/videos?sort=trending`);
        if (!res.ok) {
          setNextVideo(null);
          return;
        }
        const data = await res.json();
        const candidate = (Array.isArray(data) ? data : []).find((entry) => entry?._id && entry._id !== id);
        setNextVideo(candidate || null);
      } catch (err) {
        setNextVideo(null);
      }
    };

    fetchNextVideo();
  }, [id]);

  useEffect(() => {
    setCommentsVisible(false);
  }, [id]);

  useEffect(() => {
    if (loading) return undefined;
    const target = commentsAnchorRef.current;
    if (!target || commentsVisible) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setCommentsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setCommentsVisible(true);
        }
      },
      { root: null, rootMargin: "350px 0px", threshold: 0.01 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [commentsVisible, loading]);

  const handleSubscribe = async () => {
    if (!video?.uploaderId) return;

    // Check if user is trying to subscribe to themselves
    if (currentUser && video.uploaderId === currentUser._id) {
      showSnackbar("You may not subscribe to yourself", "warning");
      return;
    }

    try {
      setSubLoading(true);
      const res = await fetch(
        `${ApiConfig.serverUrl}/api/users/${video.uploaderId}/subscribe`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (res.status === 401) {
        showPromptLogin(true);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unknown server error");
      }

      setSubscribed(data.subscribed);
      setUploaderSubs((prev) =>
        data.subscribed ? prev + 1 : Math.max(prev - 1, 0),
      );
    } catch (err) {
      console.error(err);
      showSnackbar("Subscription action failed: " + err.message);
    } finally {
      setSubLoading(false);
    }
  };

  const handleNextVideo = () => {
    if (!nextVideo?._id) return;
    navigate(`/watch/${nextVideo._id}`);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <Container sx={{ mb: 4 }}>
        <div className="row">
          <div className="col-lg-8 mb-4">
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" sx={{ width: "100%", height: { xs: 300, md: 500 }, borderRadius: 2 }} />
            </Box>
            <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="30%" height={24} />
            </Box>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
          </div>
          <div className="col-lg-4">
            <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Skeleton variant="rectangular" width={168} height={94} sx={{ borderRadius: 1 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            ))}
          </div>
        </div>
      </Container>
    );

  if (!video)
    return (
      <Container sx={{ mb: 4 }}>
        <Card
          elevation={1}
          sx={{
            mt: 4,
            p: { xs: 3, sm: 4 },
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.25,
              color: "text.secondary",
              mb: 2,
            }}
          >
            <VideocamOffIcon sx={{ fontSize: 34 }} />
            <SentimentDissatisfiedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="h4" gutterBottom>
            Video not found
          </Typography>
          <Typography color="text.secondary">
            This video may have been removed, made private, or the link may be incorrect.
          </Typography>
        </Card>
      </Container>
    );

  const uploadedAgo = getRelativeTime(video.uploadedAt);
  const formattedUploadDate = video.uploadedAt
    ? new Date(video.uploadedAt).toLocaleDateString()
    : "";

  const startAtFromQuery = (() => {
    const raw = new URLSearchParams(location.search).get("t");
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
  })();

  const isPaused = document.getElementById("main-video-player")?.paused;

  return (
    <>
      <Container sx={{ mb: 4 }}>
        <div className="row">
          {/* Left column: video player and details */}
          <div className="col-lg-8 mb-4">
            <div className="card-body">
              {/* Video player */}
              <Box sx={{ mb: 2 }}>
                <VideoPlayer
                  onContextMenu={handleContextMenu}
                  src={`${ApiConfig.serverUrl}/data/uploads/${video.filename}`}
                  autoPlay={true}
                  videoElementId="main-video-player"
                  startAtSeconds={startAtFromQuery}
                  onNextVideo={handleNextVideo}
                  hasNextVideo={Boolean(nextVideo?._id)}
                  nextVideoTitle={nextVideo?.title || ""}
                />
                <Menu
                  open={contextMenu !== null}
                  onClose={handleClose}
                  anchorReference="anchorPosition"
                  anchorPosition={
                    contextMenu !== null
                      ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                      : undefined
                  }
                  slotProps={{
                    paper: {
                      sx: {
                        backgroundColor: "background.paper",
                        color: "text.primary",
                        "& .MuiMenuItem-root": {
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem onClick={handlePlayPause}>
                    <ListItemIcon>
                      <i
                        className={`bi ${isPaused ? "bi-play-fill" : "bi-pause-fill"}`}
                        style={{ color: "white" }}
                      ></i>
                    </ListItemIcon>
                    <ListItemText>{isPaused ? "Play" : "Pause"}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleRestart}>
                    <ListItemIcon>
                      <i
                        className="bi bi-arrow-repeat"
                        style={{ color: "white" }}
                      ></i>
                    </ListItemIcon>
                    <ListItemText>Restart</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleCopyTimestamp}>
                    <ListItemIcon>
                      <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Copy link at current time</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleAddBookmarkAtCurrentTime}>
                    <ListItemIcon>
                      <BookmarkAddIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Add bookmark at this time</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mb-2">
                  {video.tags.map((tag, index) => (
                    <Chip label={tag} key={index} className="me-1" />
                  ))}
                </div>
              )}

              {/* Title */}
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {video.title}
              </Typography>

              {/* Video statistics */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {video.views} views • Uploaded {uploadedAgo} (
                {formattedUploadDate})
              </Typography>

              {/* Video action bar i.e like dislike share etc */}
              <VideoActionBar
                videoId={video._id}
                onOpenBookmarks={() => setBookmarksDialogOpen(true)}
              />

              {/* Uploader + subscribe */}
              <ChannelBar
                video={video}
                uploaderSubs={uploaderSubs}
                subscribed={subscribed}
                subLoading={subLoading}
                handleSubscribe={handleSubscribe}
              />

              {/* Description */}
              <Card sx={{ p: 1.5, mb: 3 }}>
                <p className="mb-1 fw-bold">Description</p>
                {video.description ? (
                  <Typography component="p" className="mb-0" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {renderTimestampLinkedText(video.description)}
                  </Typography>
                ) : (
                  <i>No description provided.</i>
                )}
                <Typography variant="body2" sx={{ mt: 3, mb: 1, display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "baseline" }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    Category:
                  </Box>
                  <Typography
                    component={Link}
                    to={`/category/${video.category || "general"}`}
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {getVideoCategoryLabel(video.category)}
                  </Typography>
                </Typography>
              </Card>
              <Divider />

              {/* Comment section */}
              <Box ref={commentsAnchorRef} sx={{ mt: 2 }}>
                {commentsVisible ? (
                  <React.Suspense
                    fallback={
                      <Box sx={{ mt: 1 }}>
                        <Skeleton variant="text" width={140} height={34} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" height={86} sx={{ borderRadius: 2, mb: 2 }} />
                        {[...Array(2)].map((_, index) => (
                          <Box key={index} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                            <Skeleton variant="circular" width={36} height={36} />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton variant="text" width="40%" />
                              <Skeleton variant="text" width="88%" />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    }
                  >
                    <CommentSection
                      videoId={video._id}
                      videoUploaderId={video.uploaderId}
                      pinnedCommentId={video.pinnedCommentId}
                    />
                  </React.Suspense>
                ) : (
                  <Card sx={{ p: 2, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                      Comments
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comments not loading? Report an issue.
                    </Typography>
                  </Card>
                )}
              </Box>
            </div>
          </div>

          {/* Right column: suggested videos */}
          <div className="col-lg-4">
            <PublicVideosList limit={10} />
          </div>
        </div>
      </Container>
      <PromptLoginDialog
        action="subscribe to this channel"
        open={promptLoginDialogShown}
        onClose={() => showPromptLogin(false)}
      />
      <AppSnackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
      <VideoBookmarks
        videoId={video._id}
        videoElementId="main-video-player"
        open={bookmarksDialogOpen}
        onClose={() => setBookmarksDialogOpen(false)}
      />
    </>
  );
}

export default Watch;
