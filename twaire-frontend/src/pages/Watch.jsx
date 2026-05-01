import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

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
            mouseX: event.clientX,
            mouseY: event.clientY,
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
        <button
          key={`desc-ts-${match.index}`}
          type="button"
          title={`Click to jump to ${token}`}
          onClick={() => {
            if (Number.isFinite(seconds)) {
              seekVideoElementToTimestamp("main-video-player", seconds);
            }
          }}
          className="btn btn-link p-0 m-0 border-0 text-primary fw-bold text-decoration-none"
          style={{ verticalAlign: 'baseline' }}
        >
          {token}
        </button>,
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
        // Not logged in
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

  useEffect(() => {
    const handleClick = () => handleClose();
    if (contextMenu) {
      window.addEventListener('click', handleClick);
    }
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  const handleSubscribe = async () => {
    if (!video?.uploaderId) return;

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
      <div className="container-fluid px-3 px-md-5 mb-5">
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="bg-light-subtle skeleton-shimmer mb-3 rounded-3" style={{ height: '450px' }}></div>
            <div className="bg-light-subtle skeleton-shimmer mb-2 rounded" style={{ height: '32px', width: '70%' }}></div>
            <div className="bg-light-subtle skeleton-shimmer mb-4 rounded" style={{ height: '24px', width: '40%' }}></div>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-light-subtle skeleton-shimmer rounded-circle" style={{ width: '40px', height: '40px' }}></div>
              <div className="bg-light-subtle skeleton-shimmer rounded" style={{ height: '24px', width: '30%' }}></div>
            </div>
            <div className="bg-light-subtle skeleton-shimmer rounded-3" style={{ height: '100px' }}></div>
          </div>
          <div className="col-lg-4">
            <div className="bg-light-subtle skeleton-shimmer mb-3 rounded" style={{ height: '24px', width: '50%' }}></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="d-flex gap-3 mb-3">
                <div className="bg-light-subtle skeleton-shimmer rounded flex-shrink-0" style={{ width: '168px', height: '94px' }}></div>
                <div className="flex-grow-1">
                  <div className="bg-light-subtle skeleton-shimmer mb-2 rounded" style={{ height: '16px', width: '100%' }}></div>
                  <div className="bg-light-subtle skeleton-shimmer rounded" style={{ height: '16px', width: '60%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (!video)
    return (
      <div className="container-fluid px-3 px-md-5 mb-5">
        <div className="card border-0 shadow-sm mt-5 p-5 text-center rounded-4">
          <div className="d-flex justify-content-center align-items-center gap-3 text-muted mb-4">
            <i className="bi bi-camera-video-off" style={{ fontSize: '3rem' }}></i>
            <i className="bi bi-emoji-frown" style={{ fontSize: '2.5rem' }}></i>
          </div>
          <h2 className="fw-bold mb-3">Video not found</h2>
          <p className="text-muted mb-0">
            This video may have been removed, made private, or the link may be incorrect.
          </p>
        </div>
      </div>
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
      <div className="container-fluid px-3 px-md-5 mb-5">
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="position-relative">
              <div className="mb-3 rounded-4 overflow-hidden shadow-sm">
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
              </div>

              {/* Custom Context Menu */}
              {contextMenu && (
                <div 
                  className="dropdown-menu show shadow-lg border-0 p-2 rounded-3" 
                  style={{ 
                    position: 'fixed', 
                    top: contextMenu.mouseY, 
                    left: contextMenu.mouseX,
                    zIndex: 2000,
                    minWidth: '220px'
                  }}
                >
                  <button className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2" onClick={handlePlayPause}>
                    <i className={`bi ${isPaused ? "bi-play-fill" : "bi-pause-fill"} me-3 fs-5`}></i>
                    <span>{isPaused ? "Play" : "Pause"}</span>
                  </button>
                  <button className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2" onClick={handleRestart}>
                    <i className="bi bi-arrow-repeat me-3 fs-5"></i>
                    <span>Restart</span>
                  </button>
                  <div className="dropdown-divider mx-2"></div>
                  <button className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2" onClick={handleCopyTimestamp}>
                    <i className="bi bi-link-45deg me-3 fs-5"></i>
                    <span>Copy link at current time</span>
                  </button>
                  <button className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2" onClick={handleAddBookmarkAtCurrentTime}>
                    <i className="bi bi-bookmark-plus me-3 fs-5"></i>
                    <span>Add bookmark at this time</span>
                  </button>
                </div>
              )}
            </div>

            {video.tags && video.tags.length > 0 && (
              <div className="mb-2 d-flex flex-wrap gap-2">
                {video.tags.map((tag, index) => (
                  <span key={index} className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="h3 fw-bold mb-2">{video.title}</h1>

            <div className="text-muted small mb-3">
              {video.views} views • Uploaded {uploadedAgo} ({formattedUploadDate})
            </div>

            <VideoActionBar
              videoId={video._id}
              onOpenBookmarks={() => setBookmarksDialogOpen(true)}
            />

            <ChannelBar
              video={video}
              uploaderSubs={uploaderSubs}
              subscribed={subscribed}
              subLoading={subLoading}
              handleSubscribe={handleSubscribe}
            />

            <div className="card border-0 bg-light rounded-4 p-4 mb-4">
              <h6 className="fw-bold mb-2">Description</h6>
              {video.description ? (
                <div className="mb-3 text-break" style={{ whiteSpace: 'pre-wrap' }}>
                  {renderTimestampLinkedText(video.description)}
                </div>
              ) : (
                <p className="text-muted fst-italic mb-3">No description provided.</p>
              )}
              
              <div className="d-flex align-items-center gap-2 small">
                <span className="fw-bold">Category:</span>
                <Link 
                  to={`/category/${video.category || "general"}`}
                  className="text-primary fw-bold text-decoration-none"
                >
                  {getVideoCategoryLabel(video.category)}
                </Link>
              </div>
            </div>

            <hr className="my-4 opacity-25" />

            <div ref={commentsAnchorRef}>
              {commentsVisible ? (
                <React.Suspense
                  fallback={
                    <div className="mt-2">
                      <div className="bg-light-subtle skeleton-shimmer mb-3 rounded" style={{ height: '24px', width: '140px' }}></div>
                      <div className="bg-light-subtle skeleton-shimmer mb-4 rounded-4" style={{ height: '86px' }}></div>
                      {[...Array(2)].map((_, index) => (
                        <div key={index} className="d-flex gap-3 mb-4">
                          <div className="bg-light-subtle skeleton-shimmer rounded-circle" style={{ width: '36px', height: '36px' }}></div>
                          <div className="flex-grow-1">
                            <div className="bg-light-subtle skeleton-shimmer mb-2 rounded" style={{ height: '16px', width: '40%' }}></div>
                            <div className="bg-light-subtle skeleton-shimmer rounded" style={{ height: '16px', width: '88%' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <CommentSection
                    videoId={video._id}
                    videoUploaderId={video.uploaderId}
                    pinnedCommentId={video.pinnedCommentId}
                  />
                </React.Suspense>
              ) : (
                <div className="card border-0 bg-light rounded-4 p-4 mb-3">
                  <h6 className="fw-bold mb-1">Comments</h6>
                  <small className="text-muted">Comments not loading? Report an issue.</small>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <h6 className="fw-bold mb-3 px-1">Up next</h6>
            <PublicVideosList limit={10} />
          </div>
        </div>
      </div>

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

      <style dangerouslySetInnerHTML={{ __html: `
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .transition-opacity { transition: opacity 0.2s ease-in-out; }
      `}} />
    </>
  );
}

export default Watch;
