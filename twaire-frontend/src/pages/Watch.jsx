import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Avatar,
  Box,
  Card,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  Typography
} from "@mui/material";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CommentSection from "../components/CommentSection.jsx";
import Loading from "../components/Loading.jsx";
import PublicVideosList from "../components/PublicVideosList.jsx";
import SubscribeButton from "../components/SubscribeButton.jsx";
import VerifiedUserBadge from "../components/VerifiedUserBadge.jsx";
import VideoActionBar from "../components/VideoActionBar.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import { getRelativeTime } from "../utils/DateUtils.jsx";

function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [uploaderSubs, setUploaderSubs] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);

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
        const videoDataRequest = await fetch(`${ApiConfig.serverUrl}/api/videos/${id}/view`, {
          method: "POST",
          credentials: "include",
        });

        if (!videoDataRequest.ok) {
          const errorData = await videoDataRequest.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch video");
        }

        const data = await videoDataRequest.json();
        setVideo(data);
        document.title = `${data.title} - Twaire`;

        if (data.uploaderId) {
          const subDataRequest = await fetch(
            `${ApiConfig.serverUrl}/api/users/${data.uploaderId}/isSubscribed`,
            { credentials: "include" }
          );

          if (subDataRequest.ok) {
            const subData = await subDataRequest.json();
            setSubscribed(subData.subscribed);
          }

          const uploaderDataRequest = await fetch(
            `${ApiConfig.serverUrl}/api/users/${data.uploader.username}`
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
      alert(video.uploader.profilePicture);
    };

    fetchVideo();
  }, [id]);

  const handleSubscribe = async () => {
    if (!video?.uploaderId) return;

    try {
      setSubLoading(true);
      const res = await fetch(
        `${ApiConfig.serverUrl}/api/users/${video.uploaderId}/subscribe`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unknown server error");
      }

      setSubscribed(data.subscribed);
      setUploaderSubs((prev) =>
        data.subscribed ? prev + 1 : Math.max(prev - 1, 0)
      );
    } catch (err) {
      console.error(err);
      alert("Subscription action failed: " + err.message);
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
  const formattedUploadDate = video.uploadedAt ? new Date(video.uploadedAt).toLocaleDateString() : "";
  const isPaused = document.getElementById("main-video-player")?.paused;

  return (
    <>
      <Container sx={{ mb: 4 }}>
        <div className="row">
          {/* Left column: video player and details */}
          <div className="col-lg-8 mb-4">
            <div className="card-body">
              {/* Video player */}
              <Box sx={{mb: 2}}>
                <VideoPlayer onContextMenu={handleContextMenu} src={`${ApiConfig.serverUrl}/data/uploads/${video.filename}`} autoPlay={true} />
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
                        backgroundColor: '#2c2c2c',
                        color: 'white',
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: '#444444',
                          },
                        },
                      },
                    }
                  }}
                >
                  <MenuItem onClick={handlePlayPause}>
                    <ListItemIcon>
                      <i className={`bi ${isPaused ? 'bi-play-fill' : 'bi-pause-fill'}`} style={{ color: 'white' }}></i>
                    </ListItemIcon>
                    <ListItemText>{isPaused ? 'Play' : 'Pause'}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleRestart}>
                    <ListItemIcon>
                      <i className="bi bi-arrow-repeat" style={{ color: 'white' }}></i>
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
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                {video.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {video.views} views • Uploaded {uploadedAgo} ({formattedUploadDate})
              </Typography>

              <VideoActionBar videoId={video._id} />

              {/* Uploader + subscribe */}

              <Card
                sx={{
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={
                      video.uploader?.profilePicture
                        ? `${ApiConfig.serverUrl}/${video.uploader.profilePicture}`
                        : `${ApiConfig.serverUrl}/api/helper/placeholder/48x48?text=${video.channel?.charAt(0)}`
                    }
                    alt="Uploader profile"
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />

                  <Box>
                    <MuiLink
                      component={Link}
                      to={`/user/${video.username}`}
                      underline="none"
                      color="text.primary"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {video.uploader.publicName || video.channel}
                      <VerifiedUserBadge user={video.uploader} verticalAlign="text-center" />
                    </MuiLink>

                    <Typography variant="body2" color="text.secondary">
                      {uploaderSubs} subscribers
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <SubscribeButton
                    subscribed={subscribed}
                    subLoading={subLoading}
                    handleSubscribe={handleSubscribe}
                  />
                </Box>
              </Card>

              {/* Description */}
              <Card sx={{p:1.5,mb:3}}>
                <p className="mb-1 fw-bold">Description</p>
                {video.description ? (
                  <p className="mb-0">{video.description}</p>
                ) : (
                  <i>No description provided.</i>
                )}
              </Card>
              <Divider />
              <CommentSection videoId={video._id} />
            </div>
          </div>

          {/* Right column: suggested videos */}
          <div className="col-lg-4">
            <PublicVideosList limit={10} />
          </div>
        </div>
      </Container>
    </>
  );
}

export default Watch;