import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import VideoCard from "../components/VideoCard.jsx";
import UserHeader from "../components/UserHeader.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";
import { Box, Button, CircularProgress, Container, Snackbar, Typography } from "@mui/material";
import SubscribeButton from "../components/SubscribeButton.jsx";
import UserTabs from "../components/UserTabs.jsx";

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

  if (loading) return <Loading label="Loading user..." />;

  if (!user)
    return (
      <>
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
      </>
    );

  return (
    <Container sx={{ mb: 10 }}>
      {user && (
        <UserHeader user={user}>
          <div className="mt-2">
            <SubscribeButton
              subscribed={subscribed}
              subLoading={subLoading}
              handleSubscribe={handleSubscribe}
            />
          </div>
        </UserHeader>
      )}

      <UserTabs user={user} videos={videos} />
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
    </Container>
  );

}

export default User;