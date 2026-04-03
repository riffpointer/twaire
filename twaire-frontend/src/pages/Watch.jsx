import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Box, Card, Chip, Container, Divider, Typography } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CommentSection from "@/components/CommentSection.jsx";
import Loading from "@/components/Loading.jsx";
import PublicVideosList from "@/components/PublicVideosList.jsx";
import VideoActionBar from "@/components/VideoActionBar.jsx";
import VideoPlayer from "@/components/VideoPlayer.jsx";
import ApiConfig from "../utils/ApiConfig.js";
import { getRelativeTime } from "../utils/DateUtils.js";
import PromptLoginDialog from "@/components/PromptLoginDialog.jsx";
import ChannelBar from "@/components/ChannelBar.jsx";
import AppSnackbar from "@/components/AppSnackbar.jsx";
import React from "react";

function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
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
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
    handleClose();
  };

  const handleRestart = () => {
    const videoElement = document.getElementById("main-video-player");
    videoElement.currentTime = 0;
    videoElement.play();
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

  if (loading) return <Loading label="Loading video..." />;

  if (!video)
    return (
      <>
        <div className="container mt-4">
          <h1>Video not found.</h1>
        </div>
      </>
    );

  const uploadedAgo = getRelativeTime(video.uploadedAt);
  const formattedUploadDate = video.uploadedAt
    ? new Date(video.uploadedAt).toLocaleDateString()
    : "";
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
                        backgroundColor: "#2c2c2c",
                        color: "white",
                        "& .MuiMenuItem-root": {
                          "&:hover": {
                            backgroundColor: "#444444",
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
              <VideoActionBar videoId={video._id} />

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
                  <p className="mb-0">{video.description}</p>
                ) : (
                  <i>No description provided.</i>
                )}
              </Card>
              <Divider />

              {/* Comment section */}
              <CommentSection videoId={video._id} />
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
    </>
  );
}

export default Watch;
