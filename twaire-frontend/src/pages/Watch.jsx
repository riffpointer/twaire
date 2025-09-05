import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import PublicVideosList from "../components/PublicVideosList.jsx";
import { getRelativeTime } from "../utils/DateUtils.jsx";
import CommentSection from "../components/CommentSection.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";
import Button from '@mui/material/Button';
import { CircularProgress } from "@mui/material";
import SubscribeButton from "../components/SubscribeButton.jsx";
import VideoActionBar from "../components/VideoActionBar.jsx";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

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
            `${ApiConfig.serverUrl}/api/users/${data.channel}`
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

  if (loading)
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <Loading label="Loading video..." />
        </div>
      </>
    );

  if (!video)
    return (
      <>
        <Navbar />
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
      <Navbar />
      <div className="container mt-4 mb-4">
        <div className="row">
          {/* Left column: video player and details */}
          <div className="col-lg-8 mb-4">
            <div className="card-body">
              {/* Video player */}
              <div className="ratio ratio-16x9 mb-3">
                <video
                  id="main-video-player"
                  controls
                  src={`${ApiConfig.serverUrl}/uploads/${video.filename}`}
                  className="w-100"
                  onContextMenu={handleContextMenu}
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
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mb-1">
                  {video.tags.map((tag, index) => (
                    <span key={index} className="badge bg-secondary me-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="mb-1">
                <strong>{video.title}</strong>
              </h2>
              <div className="text-muted small mb-3">
                {video.views} views • Uploaded {uploadedAgo} ({formattedUploadDate})
              </div>

              {/* Uploader + subscribe */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <img
                    src={
                      video.uploaderProfilePicture
                        ? `${ApiConfig.serverUrl}/${video.uploaderProfilePicture}`
                        : "https://placehold.co/48x48?text=User"
                    }
                    alt="Uploader profile"
                    className="rounded-circle me-2"
                    width={48}
                    height={48}
                  />
                  <div>
                    <Link
                      to={`/user/${video.username || video.channel}`}
                      className="fw-bold text-dark text-decoration-none"
                    >
                      {video.channel || video.username}
                    </Link>
                    {video.verified && (
                      <i
                        className="bi bi-patch-check-fill text-primary ms-1"
                        title="Verified channel"
                      ></i>
                    )}
                    <div className="text-muted small">
                      {uploaderSubs} subscribers
                    </div>
                  </div>
                </div>

                <div>
                  <SubscribeButton
                    subscribed={subscribed}
                    subLoading={subLoading}
                    handleSubscribe={handleSubscribe}
                  />
                </div>
              </div>

              <VideoActionBar videoId={video._id} />

              {/* Description */}
              <div className="card p-3 mb-3">
                <p className="mb-1 fw-bold">Description</p>
                {video.description ? (
                  <p className="mb-0">{video.description}</p>
                ) : (
                  <i>No description provided.</i>
                )}
              </div>
              <hr />
              <CommentSection videoId={video._id} />
            </div>
          </div>

          {/* Right column: suggested videos */}
          <div className="col-lg-4">
            <PublicVideosList limit={10} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Watch;