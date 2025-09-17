import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import VideoCard from "../components/VideoCard.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";
import { Button, CircularProgress, Snackbar, Card, Typography } from "@mui/material";
import SubscribeButton from "../components/SubscribeButton.jsx";

function User() {
  const { username } = useParams(); // URL: /user/:username
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchUserAndVideos = async () => {
      try {
        // Fetch user data
        const resUser = await fetch(`${ApiConfig.serverUrl}/api/users/${username}`);
        if (!resUser.ok) {
          const errData = await resUser.json().catch(() => ({}));
          throw new Error(errData.error || "User not found");
        }
        const userData = await resUser.json();
        setUser(userData);

        // Fetch user's videos
        const resVideos = await fetch(`${ApiConfig.serverUrl}/api/videos?uploader=${userData._id}`);
        if (!resVideos.ok) {
          const errData = await resVideos.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch videos");
        }
        const videosData = await resVideos.json();
        setVideos(videosData);

        // Check subscription status
        const subRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${userData._id}/isSubscribed`,
          { credentials: "include" }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscribed(subData.subscribed);
        }

        document.title = `${userData.username} - Twaire`;
      } catch (err) {
        console.error(err);
        showSnackbar(`Unable to load videos: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndVideos();
  }, [username, subscribed]);

  const handleSubscribe = async () => {
    if (!user?._id) return;
    try {
      setSubLoading(true);
      const res = await fetch(`${ApiConfig.serverUrl}/api/users/${user._id}/subscribe`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setSubscribed(data.subscribed);
    } catch (err) {
      console.error(err);
      showSnackbar("Subscription failed: " + err.message, "error");
    } finally {
      setSubLoading(false);
    }
  };

  const getSnackbarIcon = (severity) => {
    switch (severity) {
      case "error":
        return <i className="bi bi-exclamation-circle-fill me-2"></i>;
      case "success":
        return <i className="bi bi-check-circle-fill me-2"></i>;
      case "warning":
        return <i className="bi bi-exclamation-triangle-fill me-2"></i>;
      case "info":
        return <i className="bi bi-info-circle-fill me-2"></i>;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <Loading label="Loading user..." />
        </div>
      </>
    );

  if (!user)
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <h1>User not found.</h1>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            ContentProps={{
              sx: {
                backgroundColor: snackbarSeverity === "error" ? "#d32f2f" : "#2e7d32",
                display: 'flex',
                alignItems: 'center'
              },
            }}
            message={
              <span className="d-flex align-items-center">
                {getSnackbarIcon(snackbarSeverity)}
                {snackbarMessage}
              </span>
            }
          />
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <Card className="p-3 mb-4">
          <div className="d-flex align-items-center mb-3">
            <img
              src={
                user.profilePicture
                  ? `${ApiConfig.serverUrl}/${user.profilePicture}`
                  : `https://placehold.co/100x100?text=${user.publicName?.charAt(0)}`
              }
              alt="Profile"
              className="rounded-circle me-3"
              width={100}
              height={100}
            />
            <div>
              <h3 className="mb-0">{user.publicName || user.username}</h3>
              <Typography color="text.secondary">@{user.username}</Typography>
              {user.verified && <span className="badge bg-success me-1">Verified</span>}
              {user.official && <span className="badge bg-primary">Official</span>}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.subscribers || 0} subscribers &bull;&nbsp;
                {user.views || 1} views
              </Typography>
              <div className="mt-2">
                <SubscribeButton
                  subscribed={subscribed}
                  subLoading={subLoading}
                  handleSubscribe={handleSubscribe}
                />
              </div>
            </div>
          </div>

          {user.bio && (
            <Card className="p-3 mb-3" variant="outlined">
              <strong>About this channel</strong>
              <p className="mb-0">{user.bio}</p>
            </Card>
          )}
        </Card>

        {videos.length > 0 && (
          <div>
            <h4 className="mb-3">Uploaded Videos</h4>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {videos.map((video) => (
                <div key={video._id} className="col">
                  <Link
                    to={`/watch/${video._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <VideoCard video={video} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length === 0 && (
          <p className="text-muted">This user has not uploaded any videos yet.</p>
        )}
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        ContentProps={{
          sx: {
            backgroundColor: snackbarSeverity === "error" ? "#d32f2f" : "#2e7d32",
            display: "flex",
            alignItems: "center",
          },
        }}
        message={
          <span className="d-flex align-items-center">
            {getSnackbarIcon(snackbarSeverity)}
            {snackbarMessage}
          </span>
        }
      />
    </>
  );

}

export default User;